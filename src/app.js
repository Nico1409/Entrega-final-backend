import express from 'express'
import handlebars from "express-handlebars"
import ProductsRoute from './routes/products.routes.js'
import ProductManager from "./class/productManager.js";
import CartsRoute from './routes/carts.routes.js'
import HomeRoute from './routes/home.routes.js'
import mongoose from 'mongoose';
import RealTimeProductsRoute from './routes/realTimeProducts.routes.js'
import { __dirname } from "./utils.js";
import {Server} from "socket.io"

const app = express()

const productManager = new ProductManager(__dirname + "/data/product.json");

app.engine("handlebars", handlebars.engine())
app.set('views', __dirname + '/views');
app.set('view engine','handlebars');

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(__dirname + '/public'));
app.use('/api/products', ProductsRoute)
app.use('/api/carts', CartsRoute)
app.use('/realtimeproducts', RealTimeProductsRoute)
app.use('/', HomeRoute)

const httpServer = app.listen(8080, () => {
    console.log('Conectado')
})

const socketServer = new Server(httpServer)

socketServer.on('connection', async (socket) => {

    async function updateProducts() {
        try {
            const productsList = await productManager.getProductList();
            socket.emit("updateProducts", productsList);
          } catch (err) {
            throw new Error(err)
          }
    }
    updateProducts()

    socket.on('addProduct', async(Product)=>{
        try {
            await productManager.addProduct(Product)
            updateProducts()
        } catch (err) {
            throw new Error(err)
        }
    });

    socket.on('deleteProduct', async(ProductId)=>{

        try {
            await productManager.deleteProduct(ProductId)
            updateProducts()
        } catch (err) {
            throw new Error(err)
        }
    });
})

// Conexion a mongo
mongoose.connect(
    'mongodb+srv://nicolas140902:ttj3Z623bX9bt8hR@coderback.jst2o.mongodb.net/?retryWrites=true&w=majority&appName=CoderBack'
)
.then(() => {
    console.log('conectado a la base de datos');
})
.catch((error) => {
    console.error('error al conectar', error);
});

