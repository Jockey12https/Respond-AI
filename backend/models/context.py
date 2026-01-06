"""
Context Risk Analyzer
Evaluates environmental and situational factors that affect emergency priority
"""
from datetime import datetime
from config import (
    CONTEXT_RISK_MIN, CONTEXT_RISK_MAX, CONTEXT_RISK_DEFAULT,
    POPULATION_DENSITY_HIGH, POPULATION_DENSITY_MEDIUM, POPULATION_DENSITY_LOW,
    TIME_RISK_NIGHT, TIME_RISK_DAY,
    WEATHER_RISK_SEVERE, WEATHER_RISK_MODERATE, WEATHER_RISK_NORMAL
)


class ContextAnalyzer:
    """Analyze contextual risk factors for emergency reports"""
    
    @staticmethod
    def calculate_context_risk(
        population_density: str = 'medium',
        time_of_day: datetime = None,
        weather_condition: str = 'normal',
        is_disaster_zone: bool = False,
        emergency_type: str = None
    ) -> float:
        """
        Calculate context risk multiplier
        
        Args:
            population_density: 'low', 'medium', or 'high'
            time_of_day: Datetime object (uses current time if None)
            weather_condition: 'normal', 'moderate', or 'severe'
            is_disaster_zone: Whether location is in a disaster-prone zone
            emergency_type: Type of emergency (for context matching)
            
        Returns:
            float: Context risk multiplier (0.5 - 1.5)
        """
        risk_multiplier = CONTEXT_RISK_DEFAULT
        
        # Population density factor
        density_factor = ContextAnalyzer._get_population_density_factor(population_density)
        risk_multiplier *= density_factor
        
        # Time of day factor
        time_factor = ContextAnalyzer._get_time_of_day_factor(time_of_day)
        risk_multiplier *= time_factor
        
        # Weather factor
        weather_factor = ContextAnalyzer._get_weather_factor(weather_condition, emergency_type)
        risk_multiplier *= weather_factor
        
        # Disaster zone boost
        if is_disaster_zone:
            risk_multiplier *= 1.2
        
        # Clamp between min and max
        risk_multiplier = max(CONTEXT_RISK_MIN, min(CONTEXT_RISK_MAX, risk_multiplier))
        
        return round(risk_multiplier, 3)
    
    @staticmethod
    def _get_population_density_factor(density: str) -> float:
        """Get risk factor based on population density"""
        density_map = {
            'high': POPULATION_DENSITY_HIGH,
            'medium': POPULATION_DENSITY_MEDIUM,
            'low': POPULATION_DENSITY_LOW
        }
        return density_map.get(density.lower(), POPULATION_DENSITY_MEDIUM)
    
    @staticmethod
    def _get_time_of_day_factor(time_of_day: datetime = None) -> float:
        """
        Get risk factor based on time of day
        Night time (10 PM - 6 AM) has higher risk
        """
        if time_of_day is None:
            time_of_day = datetime.now()
        
        hour = time_of_day.hour
        
        # Night time: 22:00 - 06:00
        if hour >= 22 or hour < 6:
            return TIME_RISK_NIGHT
        else:
            return TIME_RISK_DAY
    
    @staticmethod
    def _get_weather_factor(weather_condition: str, emergency_type: str = None) -> float:
        """
        Get risk factor based on weather conditions
        Weather impact varies by emergency type
        """
        weather_map = {
            'severe': WEATHER_RISK_SEVERE,
            'moderate': WEATHER_RISK_MODERATE,
            'normal': WEATHER_RISK_NORMAL
        }
        
        base_factor = weather_map.get(weather_condition.lower(), WEATHER_RISK_NORMAL)
        
        # Increase factor if weather matches emergency type
        if emergency_type:
            weather_related_emergencies = ['FLOOD', 'NATURAL_DISASTER', 'INFRASTRUCTURE']
            if emergency_type in weather_related_emergencies and weather_condition == 'severe':
                base_factor *= 1.1  # Extra boost for weather-related emergencies during bad weather
        
        return base_factor
    
    @staticmethod
    def get_location_risk_profile(latitude: float, longitude: float) -> dict:
        """
        Get risk profile for a specific location
        In a real system, this would query a database or API
        
        Args:
            latitude: Location latitude
            longitude: Location longitude
            
        Returns:
            dict: Location risk profile
        """
        # This is a simplified example
        # In production, you would:
        # 1. Query population density from census data
        # 2. Check disaster-prone zones database
        # 3. Get current weather from weather API
        # 4. Check historical emergency data for the area
        
        # Example: Kerala coordinates (8.5, 76.9)
        # This is mock data for demonstration
        
        return {
            'population_density': 'medium',
            'is_disaster_zone': False,
            'historical_emergency_count': 0,
            'nearest_emergency_services': {
                'police': 2.5,  # km
                'fire': 3.1,    # km
                'medical': 1.8  # km
            }
        }
    
    @staticmethod
    def assess_response_time(latitude: float, longitude: float, emergency_type: str) -> dict:
        """
        Assess expected response time based on location and emergency type
        
        Args:
            latitude: Location latitude
            longitude: Location longitude
            emergency_type: Type of emergency
            
        Returns:
            dict: Response time assessment
        """
        # Get location profile
        profile = ContextAnalyzer.get_location_risk_profile(latitude, longitude)
        
        # Determine which service is needed
        service_map = {
            'FIRE': 'fire',
            'MEDICAL': 'medical',
            'CRIME': 'police',
            'INFRASTRUCTURE': 'fire',
            'NATURAL_DISASTER': 'fire'
        }
        
        service = service_map.get(emergency_type, 'police')
        distance = profile['nearest_emergency_services'].get(service, 5.0)
        
        # Estimate response time (simplified)
        # Assume average speed of 40 km/h in emergency
        estimated_minutes = (distance / 40) * 60
        
        return {
            'service_type': service,
            'distance_km': distance,
            'estimated_response_minutes': round(estimated_minutes, 1),
            'urgency_level': 'HIGH' if estimated_minutes > 15 else 'MEDIUM' if estimated_minutes > 10 else 'LOW'
        }


# Example usage and testing
if __name__ == '__main__':
    analyzer = ContextAnalyzer()
    
    print("Context Analyzer Test Cases:")
    print("-" * 60)
    
    # Test Case 1: High-risk context (high density, night, severe weather)
    print("Case 1: High-Risk Context")
    night_time = datetime(2026, 1, 4, 23, 30)  # 11:30 PM
    risk = analyzer.calculate_context_risk(
        population_density='high',
        time_of_day=night_time,
        weather_condition='severe',
        is_disaster_zone=True,
        emergency_type='FLOOD'
    )
    print(f"Context Risk: {risk}")
    print()
    
    # Test Case 2: Low-risk context
    print("Case 2: Low-Risk Context")
    day_time = datetime(2026, 1, 4, 14, 0)  # 2:00 PM
    risk = analyzer.calculate_context_risk(
        population_density='low',
        time_of_day=day_time,
        weather_condition='normal',
        is_disaster_zone=False
    )
    print(f"Context Risk: {risk}")
    print()
    
    # Test Case 3: Medium context (from spec example)
    print("Case 3: Medium Context")
    risk = analyzer.calculate_context_risk(
        population_density='medium',
        weather_condition='normal'
    )
    print(f"Context Risk: {risk}")
    print()
    
    # Test Case 4: Location risk profile
    print("Case 4: Location Risk Profile")
    profile = analyzer.get_location_risk_profile(8.524, 76.936)
    print(f"Profile: {profile}")
    print()
    
    # Test Case 5: Response time assessment
    print("Case 5: Response Time Assessment")
    response = analyzer.assess_response_time(8.524, 76.936, 'FIRE')
    print(f"Response Assessment: {response}")
    print("-" * 60)
