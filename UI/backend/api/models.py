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
    
    # Operational Features (Inputs for ML)
    hours = models.DecimalField("Hours on Stream", max_digits=5, decimal_places=2, default=24.00)
    whp = models.DecimalField("Wellhead Pressure", max_digits=10, decimal_places=2, default=0)
    wht = models.DecimalField("Wellhead Temperature", max_digits=10, decimal_places=2, default=0)
    wlp = models.DecimalField("Line Pressure", max_digits=10, decimal_places=2, default=0)
    h2o = models.DecimalField("H2O %", max_digits=10, decimal_places=2, default=0)
    water = models.DecimalField("Water Volume", max_digits=15, decimal_places=3, default=0)
    prodindex = models.DecimalField("Productivity Index", max_digits=10, decimal_places=4, null=True, blank=True)
    
    # Yields (Targets for ML)
    w_gas = models.DecimalField("Wet Gas", max_digits=15, decimal_places=3, default=0)
    s_gas = models.DecimalField("Sweet Gas", max_digits=15, decimal_places=3, default=0)
    lpg_mass = models.DecimalField("LPG Mass", max_digits=15, decimal_places=3, default=0)
    lpg_vol = models.DecimalField("LPG Vol", max_digits=15, decimal_places=3, default=0)
    cond_vol = models.DecimalField("Condensate Volume", max_digits=15, decimal_places=3, default=0)
    cond_mass = models.DecimalField("Condensate Mass", max_digits=15, decimal_places=3, default=0)

    # Chemical Compositions (NGLs)
    c2m = models.DecimalField("C2- (Ethane/Methane)", max_digits=10, decimal_places=4, null=True, blank=True)
    c3 = models.DecimalField("Propane", max_digits=10, decimal_places=4, null=True, blank=True)
    c4 = models.DecimalField("Butane", max_digits=10, decimal_places=4, null=True, blank=True)
    c5p = models.DecimalField("C5+ (Pentanes Plus)", max_digits=10, decimal_places=4, null=True, blank=True)
    
    # Metadata
    tag = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ('well', 'date')
        ordering = ['-date']