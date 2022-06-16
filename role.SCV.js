var roleSCV = {

    /** @param {Creep} creep **/
    

    run: function (creep) {
        var nums = creep.memory.num;
        if (creep.store.energy == 0) {
            // creep.say('🔄 harvest');
            creep.memory.working = false;
            creep.memory.task = 0;
        }
        if (!creep.memory.working && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
            // creep.say('working');
            creep.memory.working = true;
            creep.memory.task = 0;
        }
        if (creep.memory.working) { //if not empty
            if(creep.memory.task == 0){
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
                creep.memory.task = 1;
                if(targets.length == 0) {
                    var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
                    creep.memory.task = 2;
                }
                if(targets.length == 0) {
                    creep.memory.task = 3;
                }
            }
            else if(creep.memory.task == 1) {
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
                if(targets.length == 0){
                    creep.memory.task = 0;
                }
                if(targets.length == 1){
                    var target = targets[0];
                }
                else{
                    var target = targets[nums];
                }
                if(creep.transfer(target,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }
            else if (creep.memory.task == 2) {
                var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
                if(targets.length == 0){
                    creep.memory.task = 0;
                }
                if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            }
            else if(creep.memory.task == 3){
                if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
            }
        } else { //if empty
            var sources = creep.room.find(FIND_SOURCES);

            if (creep.harvest(sources[nums]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[nums]);
            }
        }

        creep.say(creep.memory.task);
    }
    
};

module.exports = roleSCV;