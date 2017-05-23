const {User,Listing,sequelize} = require('./model.js');
const Service = require('soa-demo-service');
const authToken = require('soa-demo-token');

async function add({token, category, title, amount},{service}) {
	const user = authToken.verify(token);
	if (! user) return {error:"Invalid Token."};
	if (! category) return {error:"Missing Category."};
	if (! title) return {error:"Missing Title."};
	if (! (amount > 0)) return {error:"Missing Amount."};
	
	const listing = await Listing.create({sellerId:user.userId, category, title, currentBidAmount:amount, nextBidAmount:amount});
	service.publish("addListing", {listingId:listing.listingId, sellerId:user.userId, category, title, amount});
	return {listing};
}

async function search({category, sellerId, sellerUsername, page}) {
	const where = {};
	if (category) where.category = category;
	if (sellerUsername && ! sellerId) {
		const seller = await User.findOne({where:{username:sellerUsername}});
		if (seller) sellerId = seller.userId;
	}
	if (sellerId) where.sellerId = sellerId;
	
	const limit = 10;
	page = page || 1;
	const offset = (page - 1) * limit;
	
	const [count, listings] = await Promise.all([
		Listing.count({where}), 
		Listing.findAll({
			where, order:['listingId'], offset, limit, 
			attributes: { exclude: ['createdAt','updatedAt'] },
			include:[{model:User,attributes:['username']}]
		})
	]);
	
	const pages = Math.ceil(count / limit);
	const fromNumber = offset + 1;
	const toNumber = offset + listings.length
	
	return {pages, count, fromNumber, toNumber, listings};
}

async function addBid({listingId, winningBidderId, currentBidAmount, nextBidAmount, numberOfBids}) {
	const listing = await Listing.findById(listingId);
	listing.update({winningBidderId, currentBidAmount, nextBidAmount, numberOfBids:sequelize.literal('"numberOfBids" + ' + numberOfBids)});
}

const service = new Service('listing');
service.add('role:listing,cmd:add', add);
service.add('role:listing,cmd:search', search);
service.add('role:listing,_cmd:addUser', ({userId, username}) => User.create({userId, username}) );
service.add('role:listing,_cmd:addBid', addBid);

module.exports = service;
