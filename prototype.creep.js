var roles = {
    harvester: require('role.harvester'),
    upgrader: require('role.upgrader'),
    SCV: require('role.SCV'),
    repairer: require('role.repairer'),
    wallRepairer: require('role.wallRepairer'),
    longDistanceHarvester: require('role.longDistanceHarvester'),
    claimer: require('role.claimer'),
    MULE: require('role.MULE'),
    Hercules: require('role.Hercules')
};

Creep.prototype.runRole =
    function () {
        roles[this.memory.role].run(this);
    };

/** @function 
    @param {bool} useContainer
    @param {bool} useSource */
Creep.prototype.getEnergy =
    function (useContainer, useSource) {
        /** @type {StructureContainer} */
        let container;
        // if the Creep should look for containers
        if (useContainer) {
            // find closest container
            container = this.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: s => (s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0) 
                //|| (s.structureType == STRUCTURE_STORAGE && s.store[RESOURCE_ENERGY] > 2000)
            });
            // if one was found
            if (container != undefined) {
                // try to withdraw energy, if the container is not in range
                if (this.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    this.moveTo(container);
                }
            }
        }
        // if no container was found and the Creep should look for Sources
        if (container == undefined && useSource) {
            // find closest source
            var dropSource = this.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
            if (this.pickup(dropSource) == ERR_NOT_IN_RANGE) {
                this.moveTo(dropSource)
                }
            if(dropSource == null){
                var source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                // try to harvest energy, if the source is not in range
                if (this.harvest(source) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    this.moveTo(source);
                }
            }
            
        }
    };