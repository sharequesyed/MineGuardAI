import { NodeTelemetry, AIRiskAssessment, RiskLevel } from '../types/telemetry';

export class BrowserRiskCalculator {
  static evaluate(nodes: NodeTelemetry[], mode: string = 'SIMULATION'): AIRiskAssessment {
    const assessmentSource = mode === 'SIMULATION' 
      ? 'Assessment: Simulation Engine' 
      : mode === 'CLOUD' 
        ? 'Assessment: ML Model' 
        : 'Assessment: Local Rule Engine';

    if (!nodes || nodes.length === 0) {
      return {
        risk_level: 'SAFE',
        risk_score: 0.05,
        affected_nodes: [],
        primary_factor: 'No active node data available.',
        assessment_source: assessmentSource,
        model_type: 'RULE_ENGINE_FALLBACK',
        dataset_label: 'Local rule engine evaluation (Backend ML offline)',
        calculated_at: new Date().toISOString(),
      };
    }


    let maxRiskScore = 0.05;
    let highestLevel: RiskLevel = 'SAFE';
    const affectedNodes: string[] = [];
    const factors: string[] = [];

    for (const node of nodes) {
      let nodeScore = 0.05;

      // 1. Tilt evaluation
      if (node.tilt_magnitude_deg > 5.0) {
        nodeScore = Math.max(nodeScore, 0.85);
        affectedNodes.push(node.node_id);
        factors.push(`${node.node_id} extreme surface tilt (${node.tilt_magnitude_deg.toFixed(1)}°)`);
      } else if (node.tilt_magnitude_deg > 2.5) {
        nodeScore = Math.max(nodeScore, 0.55);
        affectedNodes.push(node.node_id);
        factors.push(`${node.node_id} moderate tilt (${node.tilt_magnitude_deg.toFixed(1)}°)`);
      }

      // 2. Relative displacement evaluation
      if (node.displacement_mm > 15.0) {
        nodeScore = Math.max(nodeScore, 0.90);
        if (!affectedNodes.includes(node.node_id)) affectedNodes.push(node.node_id);
        factors.push(`${node.node_id} critical displacement delta (${node.displacement_mm.toFixed(1)}mm)`);
      } else if (node.displacement_mm > 6.0) {
        nodeScore = Math.max(nodeScore, 0.60);
        if (!affectedNodes.includes(node.node_id)) affectedNodes.push(node.node_id);
        factors.push(`${node.node_id} elevated displacement (${node.displacement_mm.toFixed(1)}mm)`);
      }

      // 3. Crack detector continuity trigger
      if (node.crack_detected) {
        nodeScore = Math.max(nodeScore, 0.95);
        if (!affectedNodes.includes(node.node_id)) affectedNodes.push(node.node_id);
        factors.push(`${node.node_id} surface crack continuity broken`);
      }

      // 4. Vibration RMS evaluation
      if (node.vibration_rms > 1.2) {
        nodeScore = Math.max(nodeScore, 0.75);
        if (!affectedNodes.includes(node.node_id)) affectedNodes.push(node.node_id);
        factors.push(`${node.node_id} abnormal surface vibration (${node.vibration_rms.toFixed(2)}g)`);
      }

      if (nodeScore > maxRiskScore) {
        maxRiskScore = nodeScore;
      }
    }

    if (maxRiskScore >= 0.80) {
      highestLevel = 'CRITICAL';
    } else if (maxRiskScore >= 0.50) {
      highestLevel = 'WARNING';
    } else {
      highestLevel = 'SAFE';
    }

    const primaryFactor = factors.length > 0 
      ? factors.join('; ') 
      : 'All surface sensor metrics within normal baseline parameters.';

    return {
      risk_level: highestLevel,
      risk_score: parseFloat(maxRiskScore.toFixed(2)),
      affected_nodes: Array.from(new Set(affectedNodes)),
      primary_factor: primaryFactor,
      assessment_source: assessmentSource,
      model_type: 'RULE_ENGINE_FALLBACK',
      dataset_label: 'Local rule engine evaluation (Backend ML offline)',
      calculated_at: new Date().toISOString(),
    };
  }
}

