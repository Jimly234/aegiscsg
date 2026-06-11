"""
Oracle Predictive Intelligence Engine
Anomaly detection module for device co-occurrence analysis.
"""

import numpy as np
from typing import List, Dict, Tuple
from collections import defaultdict
from dataclasses import dataclass


@dataclass
class DeviceEvent:
    device_id: str
    location_grid: str
    timestamp: int
    event_type: str = "scan"


class AnomalyDetector:
    """
    Detects anomalous device co-occurrence patterns in mesh scan data.
    Uses statistical methods + simplified graph analysis.
    """
    
    def __init__(self, min_cooccurrences: int = 3, time_window_seconds: int = 3600):
        self.min_cooccurrences = min_cooccurrences
        self.time_window = time_window_seconds
        self.grid_history: Dict[str, List[DeviceEvent]] = defaultdict(list)
        self.device_pairs: Dict[Tuple[str, str], List[int]] = defaultdict(list)
        self.baseline_density: Dict[str, float] = {}
    
    def ingest_event(self, event: DeviceEvent):
        """Ingest a single device scan event."""
        self.grid_history[event.location_grid].append(event)
        
        # Update co-occurrence pairs within time window
        cutoff = event.timestamp - self.time_window
        grid_events = [
            e for e in self.grid_history[event.location_grid]
            if e.timestamp > cutoff
        ]
        
        for other in grid_events:
            if other.device_id != event.device_id:
                pair = tuple(sorted([event.device_id, other.device_id]))
                if event.timestamp not in self.device_pairs[pair]:
                    self.device_pairs[pair].append(event.timestamp)
        
        # Update baseline
        self._update_baseline(event.location_grid)
    
    def _update_baseline(self, grid_id: str):
        """Update baseline device density for a grid cell."""
        events = self.grid_history[grid_id]
        if len(events) >= 10:
            # Simple moving average
            recent = events[-100:]
            self.baseline_density[grid_id] = len(recent) / max(1, len(set(e.timestamp for e in recent)))
    
    def detect_anomalies(self) -> List[Dict]:
        """Find suspicious device co-occurrence clusters."""
        anomalies = []
        
        for pair, timestamps in self.device_pairs.items():
            if len(timestamps) >= self.min_cooccurrences:
                # Calculate co-occurrence score
                score = min(1.0, len(timestamps) / 10.0)
                
                # Check if across multiple locations
                grids = set()
                for ts in timestamps[-self.min_cooccurrences:]:
                    for event in sum(self.grid_history.values(), []):
                        if event.device_id in pair and event.timestamp == ts:
                            grids.add(event.location_grid)
                
                if len(grids) >= 2:
                    anomalies.append({
                        "device1": pair[0],
                        "device2": pair[1],
                        "co_occurrences": len(timestamps),
                        "locations": list(grids),
                        "risk_score": round(0.5 + score * 0.5, 2),
                        "confidence": round(min(0.95, 0.3 + len(timestamps) * 0.05), 2),
                    })
        
        return sorted(anomalies, key=lambda x: x["risk_score"], reverse=True)
    
    def get_grid_risk(self, grid_id: str, current_density: int) -> Dict:
        """Calculate risk score for a grid cell."""
        baseline = self.baseline_density.get(grid_id, 5.0)
        
        density_ratio = current_density / max(baseline, 0.1)
        risk_score = min(1.0, density_ratio * 0.3)
        
        return {
            "grid_id": grid_id,
            "current_density": current_density,
            "baseline_density": baseline,
            "density_ratio": round(density_ratio, 2),
            "risk_score": round(risk_score, 2),
        }
    
    def clear_old_data(self, max_age_seconds: int = 86400):
        """Clean data older than specified age."""
        cutoff = int(time.time()) - max_age_seconds if hasattr(time, 'time') else 0
        
        for grid in list(self.grid_history.keys()):
            self.grid_history[grid] = [
                e for e in self.grid_history[grid] if e.timestamp > cutoff
            ]
            if not self.grid_history[grid]:
                del self.grid_history[grid]
        
        for pair in list(self.device_pairs.keys()):
            self.device_pairs[pair] = [
                ts for ts in self.device_pairs[pair] if ts > cutoff
            ]
            if not self.device_pairs[pair]:
                del self.device_pairs[pair]
