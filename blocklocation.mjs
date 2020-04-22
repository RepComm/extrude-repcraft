
export default class BlockLocation {
  /**
   * @param {Number} x
   * @param {Number} y 
   * @param {Number} z 
   * @param {Material} material 
   */
  constructor(x = 0, y = 0, z = 0, material) {
    this.x = x;
    this.y = y
    this.z = z;
    /**@type {Material}*/
    this.material = material;
  }
  /**@static Create a log message of a block location
   * @returns {String} "<x>, <y>, <z>"
   */
  static createLogMessage (blockLocation) {
    if (blockLocation === undefined) return " <you shouldn't be seeing this..>";
    return blockLocation.x + ", " + blockLocation.y + ", " + blockLocation.z;
  }
  /**Set an axis by its name
 * @param {"X"|"Y"|"Z"} axis
 * @param {Number} val
 */
  setAxis(axis, val) {
    if (axis === "X") {
      this.x = val;
      return;
    } else if (axis === "Y") {
      this.y = val;
      return;
    } else if (axis === "Z") {
      this.z = val;
      return;
    }
  }
  /**Add to an axis by its name
   * @param {"X"|"Y"|"Z"} axis
   * @param {Number} val number to add to the axis
   */
  addAxis(axis, val) {
    if (axis === "X") {
      this.x += val;
      return;
    } else if (axis === "Y") {
      this.y += val;
      return;
    } else if (axis === "Z") {
      this.z += val;
      return;
    }

  }
  set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  copyFrom(otherLoc) {
    this.x = otherLoc.x;
    this.y = otherLoc.y;
    this.z = otherLoc.z;
    this.material = otherLoc.material;
  }
}