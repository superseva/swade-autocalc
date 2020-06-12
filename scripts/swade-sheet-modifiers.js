class SwadeSheetExtender extends FormApplication{
  constructor(object, options){
    super(object, options);
    this.entity.apps[this.appId] = this;
  }

  get entity() {
    return this.object;
  }

  activateListeners(html) {
    super.activateListeners(html);
  }

  static updateActorToughness(actor){
    let _toughnessBase = actor.data.data.attributes.vigor.die.sides/2 + 2;
    let _toughnessPlusModiffier = _toughnessBase + actor.data.data.stats.toughness.armor;
    let _actor = game.actors.get(actor._id);
    _actor.update({ 'data.stats.toughness.value': _toughnessPlusModiffier });
  }

  static updateActorParry(actor, _fighting){
    var fighting = 0;
    for(let i=0; i<actor.data.items.length; i++){
      let itm = actor['data']['items'][i];
      if(itm.name == 'Fighting' && itm.type=='skill'){
           fighting = itm.data.die.sides;
           break;
      }
    }

    let _parryBase = fighting/2 + 2;
    let _parryPlusModiffier = _parryBase + actor.data.data.stats.parry.modifier;
    let _actor = game.actors.get(actor._id);
    _actor.update({ 'data.stats.parry.value': _parryPlusModiffier });
  }

  static getVar = function(obj, key) {
      return key.split(".").reduce(function(o, x) {
          return (typeof o == "undefined" || o === null) ? o : o[x];
      }, obj);
  }

}
/* Adding Hooks */
Hooks.on('init', () => {
	//CONFIG.debug.hooks = true;
});

Hooks.on('renderActorSheet', (app, html, data) => {
    let parryField = html.find('#parry');
    let parryModifierValue = data.data.stats.parry.modifier;
    let parryModifierFiled = $(`<input id="parry-modifier" name="data.stats.parry.modifier" value="${parryModifierValue}" type="text" placeholder="0" data-dtype="Number">`);
    parryModifierFiled.insertAfter(parryField);

     let toughnessField = html.find('#toughness');
     let armorValue = data.data.stats.toughness.armor;
     let armorField = $(`<input id="toughness-armor" name="data.stats.toughness.armor" value="${armorValue}" type="text" placeholder="0" data-dtype="Number">`);
     armorField.insertAfter(toughnessField);
});

Hooks.on('updateActor', (actor, data, diff) => {
    // UPDATE TOUGHNESS BY CHANGING ARMOR VALUE
    if(SwadeSheetExtender.getVar(data, 'data.stats.toughness.armor')!=undefined || SwadeSheetExtender.getVar(data, 'data.attributes.vigor.die')!=undefined){
      SwadeSheetExtender.updateActorToughness(actor);
    }
    // UPDATE PARRY BY CHANGING MODIFIER VALUE
    if(SwadeSheetExtender.getVar(data, 'data.stats.parry.modifier')!=undefined){
      SwadeSheetExtender.updateActorParry(actor);
    }
});

Hooks.on('updateOwnedItem', (actor, item, data) => {
  // UPDATE PARRY BY CHANGING FIGHTING SKILL VALUE
  if(item.name == 'Fighting' && item.type=='skill'){
    SwadeSheetExtender.updateActorParry(actor, item.data.die.sides);
  }
});

Hooks.on('createOwnedItem', (actor, item, data) =>{
  // UPDATE PARRY BY ADDING FIGHTING SKILL
	if(item.name == 'Fighting' && item.type=='skill'){
    SwadeSheetExtender.updateActorParry(actor, item.data.die.sides);
  }
});
