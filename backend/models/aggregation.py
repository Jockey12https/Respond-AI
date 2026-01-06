"""
Multi-Report Aggregation System
Handles clustering and priority boosting for multiple reports of the same incident
"""
import math
from typing import List, Dict
from config import AGGREGATION_BOOST_FACTOR, AGGREGATION_LOCATION_RADIUS


class ReportAggregator:
    """Aggregate multiple reports of the same incident"""
    
    @staticmethod
    def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate distance between two coordinates using Haversine formula
        
        Args:
            lat1, lon1: First coordinate
            lat2, lon2: Second coordinate
            
        Returns:
            float: Distance in kilometers
        """
        # Earth radius in kilometers
        R = 6371.0
        
        # Convert to radians
        lat1_rad = math.radians(lat1)
        lon1_rad = math.radians(lon1)
        lat2_rad = math.radians(lat2)
        lon2_rad = math.radians(lon2)
        
        # Haversine formula
        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon1_rad
        
        a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        distance = R * c
        return round(distance, 3)
    
    @staticmethod
    def are_reports_similar(report1: Dict, report2: Dict) -> bool:
        """
        Check if two reports are about the same incident
        
        Args:
            report1: First report dictionary
            report2: Second report dictionary
            
        Returns:
            bool: True if reports are likely about the same incident
        """
        # Check location proximity
        if 'location' in report1 and 'location' in report2:
            loc1 = report1['location']
            loc2 = report2['location']
            
            if 'lat' in loc1 and 'lat' in loc2:
                distance = ReportAggregator.calculate_distance(
                    loc1['lat'], loc1['lng'],
                    loc2['lat'], loc2['lng']
                )
                
                if distance > AGGREGATION_LOCATION_RADIUS:
                    return False  # Too far apart
        
        # Check emergency type similarity
        if 'emergency_type' in report1 and 'emergency_type' in report2:
            if report1['emergency_type'] != report2['emergency_type']:
                return False  # Different types of emergencies
        
        # Check time proximity (reports within 30 minutes)
        if 'created_at' in report1 and 'created_at' in report2:
            from datetime import datetime
            time1 = datetime.fromisoformat(report1['created_at'].replace('Z', '+00:00'))
            time2 = datetime.fromisoformat(report2['created_at'].replace('Z', '+00:00'))
            time_diff = abs((time1 - time2).total_seconds() / 60)  # minutes
            
            if time_diff > 30:
                return False  # Too far apart in time
        
        return True
    
    @staticmethod
    def cluster_reports(reports: List[Dict]) -> List[List[Dict]]:
        """
        Cluster reports by similarity
        
        Args:
            reports: List of report dictionaries
            
        Returns:
            List of clusters, where each cluster is a list of similar reports
        """
        if not reports:
            return []
        
        clusters = []
        processed = set()
        
        for i, report1 in enumerate(reports):
            if i in processed:
                continue
            
            cluster = [report1]
            processed.add(i)
            
            for j, report2 in enumerate(reports):
                if j <= i or j in processed:
                    continue
                
                if ReportAggregator.are_reports_similar(report1, report2):
                    cluster.append(report2)
                    processed.add(j)
            
            clusters.append(cluster)
        
        return clusters
    
    @staticmethod
    def calculate_combined_priority(base_priority: float, report_count: int) -> float:
        """
        Calculate combined priority with multi-report boost
        Formula: combined_priority = max(final_priority) + 0.1 * log(report_count)
        
        Args:
            base_priority: Highest priority score among clustered reports
            report_count: Number of reports in the cluster
            
        Returns:
            float: Combined priority score
        """
        if report_count <= 1:
            return base_priority
        
        # Apply logarithmic boost
        boost = AGGREGATION_BOOST_FACTOR * math.log(report_count)
        combined = base_priority + boost
        
        # Cap at 1.0
        combined = min(1.0, combined)
        
        return round(combined, 3)
    
    @staticmethod
    def aggregate_cluster(cluster: List[Dict]) -> Dict:
        """
        Aggregate a cluster of reports into a single incident
        
        Args:
            cluster: List of similar reports
            
        Returns:
            dict: Aggregated incident information
        """
        if not cluster:
            return {}
        
        # Find highest priority report
        max_priority_report = max(cluster, key=lambda r: r.get('final_priority', 0))
        
        # Calculate combined priority
        combined_priority = ReportAggregator.calculate_combined_priority(
            max_priority_report.get('final_priority', 0),
            len(cluster)
        )
        
        # Aggregate evidence
        evidence_types = [r.get('evidence_type') for r in cluster if r.get('evidence_type')]
        best_evidence = max(evidence_types, key=lambda e: {
            'camera': 4, 'image_geo': 3, 'image': 2, 'text': 1
        }.get(e, 0)) if evidence_types else 'text'
        
        # Calculate average location
        locations = [r.get('location') for r in cluster if r.get('location')]
        if locations:
            avg_lat = sum(loc['lat'] for loc in locations) / len(locations)
            avg_lng = sum(loc['lng'] for loc in locations) / len(locations)
            avg_location = {'lat': round(avg_lat, 6), 'lng': round(avg_lng, 6)}
        else:
            avg_location = None
        
        return {
            'report_count': len(cluster),
            'report_ids': [r.get('id') for r in cluster],
            'primary_report': max_priority_report,
            'combined_priority': combined_priority,
            'best_evidence_type': best_evidence,
            'average_location': avg_location,
            'unique_reporters': len(set(r.get('user_id') for r in cluster)),
            'description': max_priority_report.get('description', ''),
            'emergency_type': max_priority_report.get('emergency_type', 'OTHER')
        }


# Example usage and testing
if __name__ == '__main__':
    aggregator = ReportAggregator()
    
    print("Report Aggregator Test Cases:")
    print("-" * 60)
    
    # Test Case 1: Distance calculation
    print("Case 1: Distance Calculation")
    dist = aggregator.calculate_distance(8.524, 76.936, 8.525, 76.937)
    print(f"Distance: {dist} km")
    print()
    
    # Test Case 2: Combined priority with multiple reports
    print("Case 2: Combined Priority (3 reports)")
    base = 0.7
    combined = aggregator.calculate_combined_priority(base, 3)
    print(f"Base Priority: {base}")
    print(f"Combined Priority: {combined}")
    print(f"Boost: +{round(combined - base, 3)}")
    print()
    
    # Test Case 3: Report clustering
    print("Case 3: Report Clustering")
    test_reports = [
        {
            'id': 1,
            'location': {'lat': 8.524, 'lng': 76.936},
            'emergency_type': 'FIRE',
            'created_at': '2026-01-04T12:00:00Z',
            'final_priority': 0.7
        },
        {
            'id': 2,
            'location': {'lat': 8.525, 'lng': 76.937},
            'emergency_type': 'FIRE',
            'created_at': '2026-01-04T12:05:00Z',
            'final_priority': 0.65
        },
        {
            'id': 3,
            'location': {'lat': 9.0, 'lng': 77.0},
            'emergency_type': 'FLOOD',
            'created_at': '2026-01-04T12:00:00Z',
            'final_priority': 0.5
        }
    ]
    
    clusters = aggregator.cluster_reports(test_reports)
    print(f"Number of clusters: {len(clusters)}")
    for i, cluster in enumerate(clusters):
        print(f"Cluster {i+1}: {len(cluster)} reports - IDs: {[r['id'] for r in cluster]}")
    print()
    
    # Test Case 4: Aggregate cluster
    print("Case 4: Aggregate Cluster")
    if clusters:
        aggregated = aggregator.aggregate_cluster(clusters[0])
        print(f"Aggregated Incident:")
        print(f"  Report Count: {aggregated['report_count']}")
        print(f"  Combined Priority: {aggregated['combined_priority']}")
        print(f"  Unique Reporters: {aggregated['unique_reporters']}")
    print("-" * 60)
