import { DataTypes } from "sequelize";
import sequelize from "../config/config.js";

const CartItem = sequelize.define(
  "CartItem",
  {
    cart_item_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cart_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "CartItems",
  }
);

CartItem.associate = (models) => {
  CartItem.belongsTo(models.Cart, { foreignKey: "cart_id", onDelete: "CASCADE" });
  CartItem.belongsTo(models.Product, { foreignKey: "product_id", onDelete: "CASCADE" });
};

export default CartItem;
