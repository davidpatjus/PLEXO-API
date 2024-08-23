import { DataTypes } from "sequelize";
import sequelize from "../config/config.js";
import Category from "./Category.js";

const Product = sequelize.define(
  "Product",{
    product_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Category,
        key: "category_id",
      },
      onDelete: "CASCADE", 
    },
  },
  {
    timestamps: false,
    tableName: "Products",
  }
);

Product.belongsTo(Category, {
  foreignKey: "category_id",
  onDelete: "CASCADE",
});

export default Product;
