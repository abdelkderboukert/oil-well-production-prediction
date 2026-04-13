from rest_framework import serializers
from .models import Well, WellProduction

class WellProductionSerializer(serializers.ModelSerializer):
    # We display the well name in the production list for better readability
    well_name = serializers.ReadOnlyField(source='well.name')

    class Meta:
        model = WellProduction
        # fields = [
        #     'id', 'well', 'well_name', 'date', 'hours', 
        #     'whp', 'wht', 'wlp', 'c2m', 'c3', 'c4', 
        #     'c5p', 'h2o', 'water', 'tag', 'created_at'
        # ]
        fields = '__all__'

class WellSerializer(serializers.ModelSerializer):
    # This allows you to see all production records when looking at a specific well
    production_history = WellProductionSerializer(many=True, read_only=True, source='production')
    
    class Meta:
        model = Well
        fields = ['id', 'name', 'uwi', 'well_type', 'production_history']