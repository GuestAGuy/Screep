module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    run: function(creep) {
        // if in target room
        if (creep.room.name == creep.memory.target) {
            // find enemy
            let targets = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            let targetStructure = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES);
            if(targets != undefined){
                if(creep.attack(targets) == ERR_NOT_IN_RANGE){
                    creep.moveTo(targets);
                }
                creep.heal(creep);
            }
            if(targetStructure != undefined){
                if(creep.attack(targetStructure) == ERR_NOT_IN_RANGE){
                    creep.moveTo(targetStructure);
                }
            }
            else{
                creep.moveTo(creep.room.controller);
            }
            
        }
        // if not in target room
        else {
            // find exit to target room
            let exit = creep.room.findExitTo(creep.memory.target);
            // move to exit
            creep.moveTo(creep.pos.findClosestByRange(exit));
        }
    }
};