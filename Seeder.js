var mongoose = require('mongoose');
var Product = require('./models/products');

mongoose.connect('localhost:27017/shopping')

var products = [
  new Product ({
    productType:'GAME',
    title: 'Gothic',
    description: 'Awesome Game!!!',
		imagePath: 'https://upload.wikimedia.org/wikipedia/en/5/5e/Gothiccover.png',
		price: 10
	}),
	new Product ({
    productType:'GAME',
		title: 'Ori',
		description: 'New Game!!',
		imagePath: 'https://i.ytimg.com/vi/cklw-Yu3moE/maxresdefault.jpg',
		price: 25
	}),
	new Product ({
    productType:'GAME',
    title: 'Fallout',
    description: 'My First Game!!!',
		imagePath: 'https://upload.wikimedia.org/wikipedia/zh/7/70/Fallout_4_cover_art.jpg',
		price: 20
	}),
	new Product ({
    productType:'GAME',
    title: 'Trine 2',
		description: 'Three idiots in game',
		imagePath: 'http://cdn.akamai.steamstatic.com/steam/apps/35720/header.jpg?t=1447354939',
		price: 30
	}),
	new Product ({
    productType:'GAME',
    title: 'inside',
    description: 'A little horrible!!',
		imagePath: 'http://cdn.akamai.steamstatic.com/steam/apps/304430/header.jpg?t=1469808964',
		price: 40
	}),
	new Product ({
    productType:'GAME',
    title: 'Limbo',
    description: 'I love it!!',
		imagePath: 'http://cdn.akamai.steamstatic.com/steam/apps/48000/header.jpg?t=1469018894',
		price: 25
	}),
]

var done = 0;

for(var i = 0; i < products.length; i++) {
  products[i].save(function(err, result) {
    done++
    if(done === products.length) {
      mongoose.disconnect();
    }
  })
}
