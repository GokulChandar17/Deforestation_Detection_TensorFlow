//Hansen dataset visualization

var gfc2014 = ee.Image('UMD/hansen/global_forest_change_2015');
Map.addLayer(gfc2014);

//forest cover in the year 2000
Map.addLayer(gfc2014, {bands: ['treecover2000']}, 'treecover2000');

//3 bands of year 2015 for healthu vegetation
Map.addLayer(
    gfc2014, {bands: ['last_b50', 'last_b40', 'last_b30']}, 'false color');
    
//in year 2000, forest extent - greeen
// forest loss - red
//forest gain - blue
Map.addLayer(gfc2014, {bands: ['loss', 'treecover2000', 'gain']}, 'green');

//brightening blue (forest gain) & red (forest loss)
Map.addLayer(gfc2014, {
  bands: ['loss', 'treecover2000', 'gain'],
  max: [1, 255, 1]
}, 'forest cover, loss, gain');

//pallete
Map.addLayer(gfc2014, {
  bands: ['treecover2000'],
  palette: ['000000', '00FF00']
}, 'forest cover palette');                     

//brighten up the image
Map.addLayer(gfc2014, {
  bands: ['treecover2000'],
  palette: ['000000', '00FF00'],
  max: 100
}, 'forest cover percent');

//masking
Map.addLayer(gfc2014.mask(gfc2014), {
  bands: ['treecover2000'],
  palette: ['000000', '00FF00'],
  max: 100
}, 'forest cover masked');

///////////////////////////////////////////
//Quantifying forest change
// Load the data and select the bands of interest.
var gfc2014 = ee.Image('UMD/hansen/global_forest_change_2015');
var lossImage = gfc2014.select(['loss']);
var gainImage = gfc2014.select(['gain']);

// Use the and() method to create the lossAndGain image.
var gainAndLoss = gainImage.and(lossImage);

// Show the loss and gain image.
Map.addLayer(gainAndLoss.updateMask(gainAndLoss),
    {palette: 'FF00FF'}, 'Gain and Loss');
    
// Displaying forest, loss, gain, and pixels where both loss and gain occur.
var gfc2014 = ee.Image('UMD/hansen/global_forest_change_2015');
var lossImage = gfc2014.select(['loss']);
var gainImage = gfc2014.select(['gain']);
var treeCover = gfc2014.select(['treecover2000']);

// Use the and() method to create the lossAndGain image.
var gainAndLoss = gainImage.and(lossImage);

// Add the tree cover layer in green.
Map.addLayer(treeCover.updateMask(treeCover),
    {palette: ['000000', '00FF00'], max: 100}, 'Forest Cover');

// Add the loss layer in red.
Map.addLayer(lossImage.updateMask(lossImage),
    {palette: ['FF0000']}, 'Loss');

// Add the gain layer in blue.
Map.addLayer(gainImage.updateMask(gainImage),
    {palette: ['0000FF']}, 'Gain');

// Show the loss and gain image.
Map.addLayer(gainAndLoss.updateMask(gainAndLoss),
    {palette: 'FF00FF'}, 'Gain and Loss');
    
// Load country features from Large Scale International Boundary (LSIB) dataset.
var countries = ee.FeatureCollection('USDOS/LSIB_SIMPLE/2017');

// Subset the ind Republic feature from countries.
var ind = countries.filter(ee.Filter.eq('country_na', 'India'));

// Get the forest loss image.
var gfc2014 = ee.Image('UMD/hansen/global_forest_change_2015');
var lossImage = gfc2014.select(['loss']);

// Sum the values of forest loss pixels in the ind Republic.
var stats = lossImage.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: ind,
  scale: 30,
  maxPixels: 1e9
});
print(stats);

//loss
print('pixels representing loss: ', stats.get('loss'));

//calculating pixel areas

// Load country features from Large Scale International Boundary (LSIB) dataset.
var countries = ee.FeatureCollection('USDOS/LSIB_SIMPLE/2017');

// Subset the ind Republic feature from countries.
var ind = countries.filter(ee.Filter.eq('country_na', 'Rep of the ind'));

// Get the forest loss image.
var gfc2014 = ee.Image('UMD/hansen/global_forest_change_2015');
var lossImage = gfc2014.select(['loss']);
var areaImage = lossImage.multiply(ee.Image.pixelArea().divide(1e6));

// Sum the values of forest loss pixels in the ind Republic.
var stats = areaImage.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: ind,
  scale: 30,
  maxPixels: 1e10
});
print('pixels representing loss: ', stats.get('loss'), 'square meters');

//finding loss and protected
// Load country features from Large Scale International Boundary (LSIB) dataset.
var countries = ee.FeatureCollection('USDOS/LSIB_SIMPLE/2017');

// Subset the India  feature from countries.
var ind = ee.Feature(
  countries
    .filter(ee.Filter.eq('country_na', 'India'))
    .first()
);

// Subset protected areas to the bounds of the ind feature
// and other criteria. Clip to the intersection with ind.
var protectedAreas = ee.FeatureCollection('WCMC/WDPA/current/polygons')
  .filter(ee.Filter.and(
    ee.Filter.bounds(ind.geometry()),
    ee.Filter.neq('IUCN_CAT', 'VI'),
    ee.Filter.neq('STATUS', 'proposed'),
    ee.Filter.lt('STATUS_YR', 2010)
  ))
  .map(function(feat){
    return ind.intersection(feat);
  });

// Get the loss image.
var gfc2014 = ee.Image('UMD/hansen/global_forest_change_2015');
var lossIn2012 = gfc2014.select(['lossyear']).eq(12);
var areaImage = lossIn2012.multiply(ee.Image.pixelArea());

// Calculate the area of loss pixels in the India.
var stats = areaImage.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: ind.geometry(),
  scale: 30,
  maxPixels: 1e9
});
print(
  'Area lost in the India',
  stats.get('lossyear'),
  'square meters'
);

// Calculate the area of loss pixels in the protected areas.
var stats = areaImage.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: protectedAreas.geometry(),
  scale: 30,
  maxPixels: 1e10
});
print(
  'Area lost in protected areas:',
  stats.get('lossyear'),
  'square meters'
);

//////////////////////////////////
// Load country boundaries from LSIB.
var countries = ee.FeatureCollection('USDOS/LSIB_SIMPLE/2017');
// Get a feature collection with just the ind feature.
var ind = countries.filter(ee.Filter.eq('country_co', 'CF'));

// Get the loss image.
// This dataset is updated yearly, so we get the latest version.
var gfc2017 = ee.Image('UMD/hansen/global_forest_change_2017_v1_5');
var lossImage = gfc2017.select(['loss']);
var lossAreaImage = lossImage.multiply(ee.Image.pixelArea());

var lossYear = gfc2017.select(['lossyear']);
var lossByYear = lossAreaImage.addBands(lossYear).reduceRegion({
  reducer: ee.Reducer.sum().group({
    groupField: 1
    }),
  geometry: ind,
  scale: 30,
  maxPixels: 1e10
});
print(lossByYear);

var statsFormatted = ee.List(lossByYear.get('groups'))
  .map(function(el) {
    var d = ee.Dictionary(el);
    return [ee.Number(d.get('group')).format("20%02d"), d.get('sum')];
  });
var statsDictionary = ee.Dictionary(statsFormatted.flatten());
print(statsDictionary);

//making a chart
var chart = ui.Chart.array.values({
  array: statsDictionary.values(),
  axis: 0,
  xLabels: statsDictionary.keys()
}).setChartType('ColumnChart')
  .setOptions({
    title: 'Yearly Forest Loss',
    hAxis: {title: 'Year', format: '####'},
    vAxis: {title: 'Area (square meters)'},
    legend: { position: "none" },
    lineWidth: 1,
    pointSize: 3
  });
print(chart);
