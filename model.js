const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL);

var User = sequelize.define('user', {
    userId: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true },
	username: { type: Sequelize.STRING, allowNull: false, unique: true },
});

var Listing = sequelize.define('listing', 
	{
		listingId: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
		sellerId: { type: Sequelize.INTEGER, allowNull: false },
		category: { type: Sequelize.STRING, allowNull: false },
		title: { type: Sequelize.STRING, allowNull: false },
		winningBidderId: { type: Sequelize.INTEGER },
		currentBidAmount: { type: Sequelize.INTEGER, allowNull: false },
		nextBidAmount: { type: Sequelize.INTEGER, allowNull: false },
		numberOfBids: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
	},{
		indexes: [
			{ fields: ['sellerId'] },
			{ fields: ['category'] },
		]
	}
);

setTimeout( () => Listing.belongsTo(User, {foreignKey:'sellerId'}), 100);

if (process.argv[2] == '--sync') {
	User.sync({force: true});
	Listing.sync({force: true});
}

exports.User = User;
exports.Listing = Listing;
exports.sequelize = sequelize;
