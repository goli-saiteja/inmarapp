function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}
function dynamicfilter(arr, obj) {
  return arr.filter(function (val) {
    var _found = true
    Object.keys(obj).forEach(function(key) {
        var oval = val[key].toLowerCase();
        var sval = obj[key].toLowerCase();
        if(key in val && oval.startsWith(sval) == false)  {
          _found = false;
        }
    })
    return _found;
  });
}

module.exports = {dynamicSort, dynamicfilter}
