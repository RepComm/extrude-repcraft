
//Imports
import ExtrudeData from "./data.mjs";
import ExtrudeMode from "./mode.mjs";

//Aliases
const PlayerInteractEvent = org.bukkit.event.player.PlayerInteractEvent;
const PlayerMoveEvent = org.bukkit.event.player.PlayerMoveEvent;
const Action = org.bukkit.event.block.Action;
const Material = org.bukkit.Material;

/** Compare one value against an array of values
 * @param {any} toCompare
 * @param {Array<any>} against 
 * @param {boolean} abs test with absolute === instead of ==
 */
function isAnyOf(toCompare, against, abs=false) {
  for (let item of against) {
    if (abs && item === toCompare) return true;
    if (!abs && item == toCompare) return true;
  }
  return false;
}

/**A map of player name to their extrude data
 * @type {Map<String, ExtrudeData}
 */
let playersExtrudeData = new Map();

/**Get or create extrude data for a player
 * @param {String} playerName
 * @returns {ExtrudeData}
 */
function getOrCreateExtrudeData(playerName) {
  if (playersExtrudeData.has(playerName)) {
    return playersExtrudeData.get(playerName);
  }
  let result = new ExtrudeData();

  playersExtrudeData.set(playerName, result);
  return result;
}

//Actions we care about when listening to player interactions
const toolSwitchActions = [Action.RIGHT_CLICK_AIR, Action.RIGHT_CLICK_BLOCK];
const toolModeUseActions = [Action.LEFT_CLICK_BLOCK, Action.LEFT_CLICK_AIR];

/**Handles every player interact w/ block event
 * @param {PlayerInteractEvent} evt 
 */
function onPlayerInteract(evt) {
  //Get the player, and his extrude data
  let player = evt.getPlayer();
  let extrudeData = getOrCreateExtrudeData(player.getName());

  let block = evt.getClickedBlock(); //CAN BE NULL

  let itemInHand = evt.getItem();

  //If no item in hand, return
  if (!itemInHand) return;
  let itemMaterial = itemInHand.getType();

  //If we're using the player's set tool, we can do extrude-y things!
  if (itemMaterial === extrudeData.toolMaterial) {
    //Cancel the interaction event so it doesn't break/replace block
    evt.setCancelled(true);

    let action = evt.getAction();

    if (isAnyOf(action, toolSwitchActions)) {
      //Switch mode of tool
      extrudeData.mode.next();

      //Tell the player about it
      player.sendMessage(
        "[Extrude] Mode is now " + extrudeData.mode.mode
      );
    } else if (isAnyOf(action, toolModeUseActions)) {
      switch (extrudeData.mode.mode) {
        case ExtrudeMode.ADDBLOCK:
          //If we're not dealing with a block, return
          if (!evt.hasBlock()) return;
          
          if (extrudeData.addBlock(
            block.getX(),
            block.getY(),
            block.getZ(),
            block.getType()
          )) {
            let bxo = block.getX() % 2;
            let byo = block.getY() % 2;
            let bzo = block.getZ() % 2;
            let doBlack = false;
            if (bxo !== 0) doBlack = !doBlack;
            if (byo !== 0) doBlack = !doBlack;
            if (bzo !== 0) doBlack = !doBlack;
  
            if (doBlack) { //X IS EVEN
              block.setType(Material.BLACK_WOOL);
            } else {
              block.setType(Material.YELLOW_WOOL);
            }
          } else {
            player.sendMessage(
              "[Extrude] Cannot add block twice"
            );
            return;
          }
          break;
        case ExtrudeMode.REMOVEBLOCK:
          //If we're not dealing with a block, return
          if (!evt.hasBlock()) return;
          if (!extrudeData.removeBlock(
            block.getX(),
            block.getY(),
            block.getZ(),
            player
          )) {
            player.sendMessage(
              "[Extrude] That block wasn't recorded, no need to remove"
            );
            return;
          }
          break;
        case ExtrudeMode.CLEAR:
          extrudeData.clearBlocks(player);
          break;
        case ExtrudeMode.AUTOCLEAR:
          extrudeData.autoClear = !extrudeData.autoClear;
          break;
        case ExtrudeMode.AXIS:
          extrudeData.nextAxis();
          break;
        case ExtrudeMode.EXTRUDE:
          if (extrudeData.isExtruding) {
            extrudeData.doExtrude(player);
            extrudeData.setExtruding(false);
          } else {
            extrudeData.setExtruding(true);
            let loc = player.getLocation();
            extrudeData.setOrigin(
              loc.getBlockX(),
              loc.getBlockY(),
              loc.getBlockZ()
            );
            player.sendMessage("[Extrude] Origin " + extrudeData.origin.X + ", " + extrudeData.origin.Y + ", " + extrudeData.origin.Z);
          }
          break;
      }
      player.sendMessage(
        extrudeData.createLastActionMessage()
      );
    }
  }
}

//Listen to player interact event
Events.on(PlayerInteractEvent, onPlayerInteract);

function onPlayerMove(evt) {
  let player = evt.getPlayer();
  let pname = player.getName();
  /**@type {ExtrudeData} */
  if (!playersExtrudeData.has(pname)) return;
  let extrudeData = playersExtrudeData.get(pname);

  if (extrudeData.isExtruding) {
    let oldSteps = extrudeData.axisSteps;
    let loc = player.getLocation();
    switch (extrudeData.axis) {
      case ExtrudeData.AXIS.X:
        extrudeData.axisSteps = loc.getBlockX() - extrudeData.origin.X;
        break;
      case ExtrudeData.AXIS.Y:
        extrudeData.axisSteps = loc.getBlockY() - extrudeData.origin.Y;
        break;
      case ExtrudeData.AXIS.Z:
        extrudeData.axisSteps = loc.getBlockZ() - extrudeData.origin.Z;
        break;
    }
    if (oldSteps !== extrudeData.axisSteps) {
      player.sendMessage(
        "[Extrude] Now " + extrudeData.axisSteps + " in " + extrudeData.axis
      );
    }
  }

}

//Listen to player move event
Events.on(PlayerMoveEvent, onPlayerMove);
