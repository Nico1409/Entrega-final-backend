import { Router } from "express";
import { __dirname } from "../utils.js";
import { CartModel } from '../models/cart.model.js';

const router = Router();


router.post("/", async (req, res) => {
  const newCart = req.body;

  try {
    let cart = await CartModel.create(newCart);

    cart = await cart.populate('products.product');

    res.status(201).json({ payload: cart });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Error al crear el carrito' });
  }
});

router.get("/:cid", async (req, res) => {
  const { cid } = req.params;

  try {

    const cart = await CartModel.findById(cid).populate('products.product');

    if (!cart) {
      return res.status(404).json({ error: "No existe un carrito con ese id" });
    }

    res.status(200).json({ payload: cart });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error al obtener el carrito' });
  }
});

router.post("/:cid/product/:pid", async (req, res) => {
  const { cid, pid } = req.params;

  try {
    const cart = await CartModel.findById(cid);

    if (!cart) {
      return res.status(404).json({ error: "No existe un carrito con ese id" });
    }

    const productInCart = cart.products.find(item => item.product.toString() === pid);

    if (productInCart) {
      productInCart.quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await cart.save();
    await cart.populate('products.product');

    res.status(201).json({ payload: cart });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error al añadir el producto al carrito' });
  }
});

router.delete("/:cid/product/:pid", async (req, res) => {
  const { cid, pid } = req.params;

  try {
    const cart = await CartModel.findById(cid);

    if (!cart) {
      return res.status(404).json({ error: "No existe un carrito con ese id" });
    }

    cart.products = cart.products.filter(item => item.product.toString() !== pid);

    await cart.save();

    res.status(200).json({ message: "Producto eliminado del carrito" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error al eliminar el producto del carrito' });
  }
});

router.delete("/:cid", async (req, res) => {
  const { cid } = req.params;

  try {
    const cart = await CartModel.findByIdAndUpdate(cid, { products: [] }, { new: true });

    if (!cart) {
      return res.status(404).json({ error: "No existe un carrito con ese id" });
    }

    res.status(200).json({ message: "Todos los productos fueron eliminados del carrito" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error al eliminar los productos del carrito' });
  }
});

router.put("/:cid", async (req, res) => {
  const { cid } = req.params;
  const { products } = req.body;

  try {
    const cart = await CartModel.findByIdAndUpdate(cid, { products }, { new: true });

    if (!cart) {
      return res.status(404).json({ error: "No existe un carrito con ese id" });
    }

    res.status(200).json({ payload: cart });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error al actualizar el carrito' });
  }
});

router.get("/", async (req, res) => {

  try {
    // Busca el primer carrito en la colección
    const cart = await CartModel.findOne().populate('products.product');

    if (!cart) {
      return res.status(404).json({ error: "No hay carritos disponibles" });
    }

    res.status(200).json({ payload: cart });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error al obtener el primer carrito' });
  }
});


export default router;
