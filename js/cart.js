/**
 * MÓDULO DEL CARRITO (js/cart.js)
 */
const STORAGE_KEY = 'techstore_cart_v1';
let carrito = cargarCarritoStorage();

function cargarCarritoStorage() {
  const guardado = localStorage.getItem(STORAGE_KEY);
  return guardado ? JSON.parse(guardado) : [];
}

function guardarCarritoStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(carrito));
}

function agregarAlCarrito(producto) {
  const index = carrito.findIndex(item => item.id === producto.id);
  if (index !== -1) {
    carrito[index].cantidad += 1;
  } else {
    carrito.push({
      id: producto.id,
      title: producto.title,
      price: producto.price,
      image: producto.image,
      cantidad: 1
    });
  }
  guardarCarritoStorage();
  actualizarInterfazCarrito();
}

function cambiarCantidad(id, cambio) {
  const index = carrito.findIndex(item => item.id === id);
  if (index !== -1) {
    carrito[index].cantidad += cambio;
    if (carrito[index].cantidad <= 0) {
      carrito.splice(index, 1);
    }
    guardarCarritoStorage();
    actualizarInterfazCarrito();
  }
}

function eliminarDelCarrito(id) {
  carrito = carrito.filter(item => item.id !== id);
  guardarCarritoStorage();
  actualizarInterfazCarrito();
}

function vaciarCarrito() {
  carrito = [];
  guardarCarritoStorage();
  actualizarInterfazCarrito();
}

function calcularTotalCarrito() {
  return carrito.reduce((sum, item) => sum + (item.price * item.cantidad), 0);
}

function contarUnidadesTotales() {
  return carrito.reduce((sum, item) => sum + item.cantidad, 0);
}