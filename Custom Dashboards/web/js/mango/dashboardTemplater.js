/**
 * Javascript Objects Used for Templating a Dashboard.
 * 
 * Inputs:
 * - Rollup Drop Down
 * - Time Period Drop Down
 * - Periods Input
 * 
 * - Start Date Picker
 * - End Date Picker
 * 
 * 
 * Copyright (C) 2014 Infinite Automation Software. All rights reserved.
 * @author Terry Packer
 */


DashboardTemplater = function(options){
    
    for(var i in options) {
        this[i] = options[i];
    }    
    
    //Ensure we have arrays for all important items
    if(this.displayConfigurations == null)
        this.displayConfigurations = new Array();
    if(this.pointConfigurations == null)
        this.pointConfigurations = new Array();
    if(this.groupConfigurations == null)
        this.groupConfigurations = new Array();
    if(this.groups == null)
        this.groups = new Array();
    
    if(this.endDate == null)
        this.endDate = new Date();
    if(this.startDate == null)
        this.startDate = new Date(this.endDate.getTime() - 1000*60*60*12); //12Hr
    if(this.rollup == null)
        this.rollup = 'AVERAGE';
    if(this.timePeriodType == null)
        this.timePeriodType = 'HOURS';
    if(this.timePeriods == null)
        this.timePeriods = 1;
    
    var self = this; //Save a reference for our actions
    
    //Setup the Inputs
    if(this.startDateConfiguration == null)
        this.startDateConfiguration = new DateTimePickerConfiguration('startDate', {}, {owner: self, onChange: self.startDateChanged});
    else{
        if(this.startDateConfiguration.owner == null)
            this.startDateConfiguration.owner = self;
        if(this.startDateConfiguration.onChange == null)
            this.startDateConfiguration.onChange = self.startDateChanged;
    } 
    this.startDateConfiguration.create();
    
    //Create End Date
    if(this.endDateConfiguration == null)
        this.endDateConfiguration = new DateTimePickerConfiguration('endDate', {}, {owner: self, onChange: self.endDateChanged});
    else{
        if(this.endDateConfiguration.owner == null)
            this.endDateConfiguration.owner = self;
        if(this.endDateConfiguration.onChange == null)
            this.endDateConfiguration.onChange = self.endDateChanged;
    } 
    this.endDateConfiguration.create();
    
    if(this.rollupConfiguration == null)
        this.rollupConfiguration = new RollupConfiguration('rollup', {}, {owner: self, onChange: self.rollupChanged, selected: this.rollup});
    else{
        if(this.rollupConfiguration.owner == null)
            this.rollupConfiguration.owner = self;
        if(this.rollupConfiguration.onChange == null)
            this.rollupConfiguration.onChange = self.rollupChanged;
    }    
    this.rollupConfiguration.create();
    
    if(this.timePeriodTypeConfiguration == null)
        this.timePeriodTypeConfiguration = new TimePeriodTypeConfiguration('timePeriodType', {}, {owner: self, onChange: self.timePeriodTypeChanged, selected: this.timePeriodType});
    else{
        if(this.timePeriodTypeConfiguration.owner == null)
            this.timePeriodTypeConfiguration.owner = self;
        if(this.timePeriodTypeConfiguration.onChange == null)
            this.timePeriodTypeConfiguration.onChange = self.timePeriodTypeChanged;
    }
    this.timePeriodTypeConfiguration.create();
  
    if(this.timePeriodConfiguration == null)
        this.timePeriodConfiguration = new InputConfiguration('timePeriod', {}, {owner: self, onChange: self.timePeriodChanged, defaultValue: this.timePeriod});
    else{
        if(this.timePeriodConfiguration.owner == null)
            this.timePeriodConfiguration.owner = self;
        if(this.timePeriodConfiguration.onChange == null)
            this.timePeriodConfiguration.onChange = self.timePeriodChanged;
    }
    this.timePeriodConfiguration.create();
    
    if(this.groupSelectConfiguration == null)
        this.groupSelectConfiguration = new SelectConfiguration('groups',{}, {owner: self, onChange: self.groupChanged, defaultValue: 0});
    else{
        if(this.groupSelectConfiguration.owner == null)
            this.groupSelectConfiguration.owner = self;
        if(this.groupSelectConfiguration.groupChanged == null)
            this.groupSelectConfiguration.onChange = self.groupChanged;
    }
    this.groupSelectConfiguration.create();
    
    //Display Manager
    if(this.displayManager == null)
        this.displayManager = new DataDisplayManager(this.displayConfigurations);
    if(this.dataProviders != null){
        for(var i=0; i<this.dataProviders.length; i++){
            this.displayManager.addProvider(this.dataProviders[i]);
        }
    }
    
    
    //Point Matcher
    if(this.pointMatcher == null)
        this.pointMatcher = new DataPointMatcher(this.pointConfigurations, this.onMatch, {owner: self});
    
    //Grouper
    if(this.groupMatcher == null){
        if(this.type == 'PointHierarchy'){
          //Fetch the Point Hierarchy to work with        
            this.deferred = mangoRest.hierarchy.getRoot(function(phRoot){

                root = phRoot; //Set the Global
               
            },this.showError); //end get data points
           
            $.when(this.deferred).then(function(){
                self.groupMatcher = new PointHierarchyGrouper(root, self.groupConfigurations, self.onGroup, {owner: self});
                self.groupMatcher.group(); //Do your job grouper
            });
        }
    }
    
};


DashboardTemplater.prototype = {
        
        debug: false,
        
        type: 'PointHierarchy', //Currently only available Option
        
        deferred: null, //Deferred to know when Templater is Ready after creation
        rollupConfiguration: null,
        timePeriodTypeConfiguration: null,
        timePeriodConfiguration: null,
        
        startDateConfiguration: null,
        endDateConfiguration: null,
        
        displayManager: null, 
        displayConfigurations: null,
        
        dataProviders: null, //List of pre-created providers
        
        pointMatcher: null,
        pointConfigurations: null,
        
        groupMatcher: null,
        groupConfigurations: null,
        groupSelectConfiguration: null,
        groups: null, //List of matched groups for drop down
        groupId: null, //Current Group ID
        
        startDate: null,
        endDate: null,
        rollup: null,
        timePeriodType: null,
        timePeriods: null,
        
        startDateChanged: function(date, $input, templater){
            if(templater.debug)
                console.log('SD: ' + date);
            templater.startDate = date;
        },
        endDateChanged: function(date, $input, templater){
            if(templater.debug)
                console.log('ED: ' + date);
            templater.endDate = date;
        },
        rollupChanged: function(rollup, templater){
            if(templater.debug)
                console.log('RU: ' + rollup);
            templater.rollup = rollup;
        },
        timePeriodTypeChanged: function(timePeriodType, templater){
            if(templater.debug)
                console.log('TPT: ' + timePeriodType);
            templater.timePeriodType = timePeriodType;
        },
        timePeriodChanged: function(timePeriods, templater){
            if(templater.debug)
                console.log('TP: ' + timePeriods);
            templater.timePeriods = timePeriods;
        },
        onMatch: function(dataPointConfiguration, templater){
            if(templater.debug)
                console.log('MatchedPoint: {name: ' + dataPointConfiguration.point.name + ", providerId: " + dataPointConfiguration.providerId + ", providerType: " + dataPointConfiguration.providerType);
            templater.displayManager.addDataPointConfiguration(dataPointConfiguration);
        },
        onGroup: function(dataPointGroup, templater){
            if(templater.debug)
                console.log('MatchedGroup: ' + dataPointGroup.label + "(" + dataPointGroup.dataPoints.length + ")");
            templater.groupSelectConfiguration.addItem(dataPointGroup.label, templater.groups.length);
            templater.groups.push(dataPointGroup);
        },
        groupChanged: function(groupId, templater){
            if(templater.debug)
                console.log('GroupChanged: ' + groupId);
            templater.groupId =  groupId;
            templater.pointMatcher.match(templater.groups[groupId].dataPoints);
            templater.displayManager.clear(); //Clear all data
            templater.refresh(null, templater);
        },
        /**
         * Refresh the providers using the dates/rollups already set in templater
         */
        refresh: function(providerIds, templater){
            templater.displayManager.refresh(providerIds, {
                from: templater.startDate, 
                to: templater.endDate, 
                rollup: templater.rollup, 
                timePeriodType: templater.timePeriodType, 
                timePeriods: templater.timePeriods
                });
        },
        
        invalidateChartSize: function(chartDivIds, templater){
            for(var i=0; i<templater.displayManager.displays.length; i++){
                var display = templater.displayManager.displays[i];
                if($.inArray(display.divId, chartDivIds) >= 0){
                   //Invlidate the chart size
                   display.amChart.invalidateSize();
               }
            }
        },
        
        /**
         * Display Errors method
         */
        showError: function(jqXHR, textStatus, errorThrown, mangoMessage){
            
            var msg = "";
            if(textStatus != null)
                msg += (textStatus + " ");
            if(errorThrown != null)
                msg += (errorThrown + " ");
            if(mangoMessage != null)
                msg += (mangoMessage + " ");
            msg += "\n";
            $("#errors").text(msg);
        }
        
};