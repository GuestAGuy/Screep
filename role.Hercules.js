module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    run: function(creep) {
        // if creep is bringing energy to a structure but has no energy left
        // creep.say(creep.store.getUsedCapacity() );
        if (creep.memory.working == true && creep.store.getUsedCapacity() == 0) {
            // switch state
            creep.memory.working = false;
        }
        // if creep is harvesting energy but is full
        else if (creep.memory.working == false && creep.store.getFreeCapacity() == 0) {
            // switch state
            creep.memory.working = true;
        }

        // if creep is supposed to transfer energy to a structure
        if (creep.memory.working == true) {
            // find closest spawn, extension or tower which is not full
            var structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                // the second argument for findClosestByPath is an object which takes
                // a property called filter which can be a function
                // we use the arrow operator to define it
                filter: (s) => (s.structureType == STRUCTURE_SPAWN
                             || s.structureType == STRUCTURE_EXTENSION
                             || s.structureType == STRUCTURE_TOWER)
                             && s.energy < s.energyCapacity
            });

            if (structure == undefined || creep.store.getUsedCapacity() > creep.store.energy) {
                structure = creep.room.storage;
            }
            
            // if we found one
            if (structure != undefined) {
                // try to transfer energy, if it is not in range
                let thing = Object.keys(creep.store);
                // console.log(thing);
                if(structure.structureType == STRUCTURE_STORAGE){
                    if (creep.transfer(structure, thing[0]) == ERR_NOT_IN_RANGE) {
                        // move towards it
                        creep.moveTo(structure);
                    }
                }
                else{
                    creep.moveTo(structure);
                    let error = creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE ;
                }
            }
        }
        // if creep is supposed to get energy
        else {
            let container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: s => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_LINK) && s.store[RESOURCE_ENERGY] >= 300
            });
            var dropSource = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
            // let tombStone = creep.pos.findClosestByPath(FIND_TOMBSTONES, {filter: s=> (s.store.length > 1)})
            if (creep.pickup(dropSource) == ERR_NOT_IN_RANGE) {
                creep.withdraw(container, RESOURCE_ENERGY);
                creep.moveTo(dropSource);
                }
            if(dropSource == null){
                // find closest container

                if (container == undefined) {
                    container = creep.room.storage;
                }

                // if one was found
                if (container != undefined) {
                    // try to withdraw energy, if the container is not in range
                    if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        // move towards it
                        creep.moveTo(container);
                    }
                }
            }
        }
    }
};