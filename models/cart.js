module.exports = function(oldCart) {
  this.items = oldCart.items || {};
  this.totalQty = oldCart.totalQty || 0;
  this.price = oldCart.price || 0;

  this.add = function(item, id, amount) {
    var storedItem = this.items[id];
    if(!storedItem) {
      storedItem = this.items[id] = {item: item, qty: 0, price: 0};
    }
    storedItem.qty+=amount;
    storedItem.price = storedItem.qty * storedItem.item.price;
    this.totalQty+=amount;
    this.price += storedItem.item.price;
  }
  // this.generateArray = function() {
	// 	var arr =  [];
	// 	for (var id in this.items) {
	// 		arr.push(this.items[id]);
	// 	}
	// 	return arr;
	// }

  this.generateArray = function(){
    var arr = [];
    for(id in this.items) {
      arr.push(this.items[id])
    }
    return arr
  }
}
