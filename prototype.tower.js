// create a new function for StructureTower
StructureTower.prototype.defend =
    function () {
        // find closes hostile creep
        var target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        var woundedCreeps = this.pos.findClosestByRange(_.filter(Game.creeps, (c) => c.hits < c.hitsMax));
        // if one is found...
        if (target != undefined) {
            // ...FIRE!
            this.attack(target);
        }
        if(woundedCreeps != undefined){
            this.heal(woundedCreeps);
        }
    };