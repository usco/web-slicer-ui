
/*extract extension from file name*/
export function getExtension (fname) {
  return fname.substr((~-fname.lastIndexOf('.') >>> 0) + 2).toLowerCase()
}
