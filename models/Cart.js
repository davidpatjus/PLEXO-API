import { DataTypes } from "sequelize";
import sequelize from "../config/config.js";


const Cart = sequelize.define(
  "Cart",
  {
    cart_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "Carts",
  }
);

Cart.associate = (models) => {
  Cart.belongsTo(models.User, {
    foreignKey: {
      allowNull: false,
    },
    onDelete: "CASCADE", // Asegurando eliminación en cascada
  });
  Cart.hasMany(models.CartItem, {
    foreignKey: "cart_id",
    onDelete: "CASCADE", // Asegurando eliminación en cascada
  });
};

export default Cart;
