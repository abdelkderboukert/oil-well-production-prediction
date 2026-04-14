# infrastructure/models.py
from django.db import models


class Well(models.Model):
    WELL_TYPES = [
        ('GAS', 'Gas'),
        ('OIL', 'Oil'),
        ('INJ', 'Injector'),
    ]
    
    name = models.CharField(max_length=50)
    uwi = models.CharField("Unique Well Identifier", max_length=20, unique=True)
    well_type = models.CharField(max_length=3, choices=WELL_TYPES, default='OIL')
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    spud_date = models.DateField("Drilling Start Date", null=True, blank=True)
    total_depth = models.DecimalField(max_digits=10, decimal_places=2, help_text="Total Vertical Depth (TVD)")

    def __str__(self):
        return f"{self.name} [{self.uwi}]"

class WellProduction(models.Model):
    well = models.ForeignKey(Well, on_delete=models.CASCADE, related_name="production")
    date = models.DateField()
    
    # Operational Data
    hours_on_stream = models.DecimalField(max_digits=5, decimal_places=2) # Max 24.00
    whp = models.DecimalField("Wellhead Pressure (psi)", max_digits=10, decimal_places=2)
    wht = models.DecimalField("Wellhead Temperature (F)", max_digits=10, decimal_places=2)
    wlp = models.DecimalField("WLP", max_digits=10, decimal_places=2)
    # h2o = models.DecimalField("H2O", max_digits=10, decimal_places=2)
    
    # Composition / Yields
    gas_flow_rate = models.DecimalField(max_digits=15, decimal_places=3, default=0)
    oil_flow_rate = models.DecimalField(max_digits=15, decimal_places=3, default=0)
    water_cut = models.DecimalField("Water %", max_digits=5, decimal_places=2)

    # Your specific chemical components (NGLs/Compositions)
    c3 = models.DecimalField("Propane", max_digits=10, decimal_places=4, null=True)
    c4 = models.DecimalField("Butane", max_digits=10, decimal_places=4, null=True)
    
    class Meta:
        unique_together = ('well', 'date') # Prevents double-entry for the same day
        ordering = ['-date']