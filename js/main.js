/**
 * ARCHIVO PRINCIPAL DE LA APLICACIÓN (js/main.js)
 */

let listaProductosGlobal = [];
let categoriaSeleccionada = 'all';

// Nodos del DOM
const productosContainer = document.getElementById('productos-container');
const loadingSpinner = document.getElementById('loading-spinner');
const totalResultsText = document.getElementById('total-results');
const inputBusqueda = document.getElementById('input-busqueda');
const selectOrden = document.getElementById('select-orden');

// Sidebar y Usuario
const btnMenu = document.getElementById('btn-menu');
const sidebarMenu = document.getElementById('sidebar-menu');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const closeSidebar = document.getElementById('close-sidebar');
const sidebarUserContainer = document.getElementById('sidebar-user-container');
const categoriasContainer = document.getElementById('categorias-container');

// Modales
const btnCarrito = document.getElementById('btn-carrito');
const cartModal = document.getElementById('cart-modal');
const cartOverlay = document.getElementById('cart-overlay');
const closeCart = document.getElementById('close-cart');
const cartCounter = document.getElementById('cart-counter');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');
const btnVaciar = document.getElementById('btn-vaciar-carrito');

const productModal = document.getElementById('product-modal');
const productModalOverlay = document.getElementById('product-modal-overlay');
const closeProductModal = document.getElementById('close-product-modal');
const productModalContent = document.getElementById('product-modal-content');

const authModal = document.getElementById('auth-modal');
const authModalOverlay = document.getElementById('auth-modal-overlay');
const closeAuthModal = document.getElementById('close-auth-modal');
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const formLogin = document.getElementById('form-login');
const formRegister = document.getElementById('form-register');

const btnCheckout = document.getElementById('btn-checkout');
const checkoutModal = document.getElementById('checkout-modal');
const checkoutModalOverlay = document.getElementById('checkout-modal-overlay');
const closeCheckoutModal = document.getElementById('close-checkout-modal');
const checkoutForm = document.getElementById('checkout-form');
const checkoutTotalPrice = document.getElementById('checkout-total-price');

// Selectores e Inputs de Envío
const selectProvincia = document.getElementById('provincia');
const selectLocalidad = document.getElementById('localidad');
const inputDireccion = document.getElementById('direccion');
const sugerenciasCalleList = document.getElementById('sugerencias-calle');
const inputTarjeta = document.getElementById('tarjeta');

const toastContainer = document.getElementById('toast-container');

function toggleModalSafe(modal, overlay, open) {
  if (modal) modal.classList.toggle('open', open);
  if (overlay) overlay.classList.toggle('open', open);
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const [productos, categorias, provincias] = await Promise.all([
      obtenerProductos(),
      obtenerCategorias(),
      obtenerProvinciasArgentina()
    ]);

    listaProductosGlobal = productos;
    if (loadingSpinner) loadingSpinner.style.display = 'none';

    cargarSelectProvincias(provincias);
    renderizarCategorias(categorias);
    filtrarYRenderizar();
    actualizarInterfazCarrito();
    actualizarSidebarUsuario();
    configurarEventosGlobales();
  } catch (err) {
    console.error("Error al inicializar la app:", err);
  }
});

function cargarSelectProvincias(provincias) {
  if (!selectProvincia) return;
  selectProvincia.innerHTML = '<option value="">Seleccione su provincia...</option>';
  provincias.forEach(prov => {
    const opt = document.createElement('option');
    opt.value = prov;
    opt.textContent = prov;
    selectProvincia.appendChild(opt);
  });
}

async function manejarCambioProvincia(e) {
  const provinciaElegida = e.target.value;
  if (!selectLocalidad) return;

  if (!provinciaElegida) {
    selectLocalidad.innerHTML = '<option value="">Seleccione primero una provincia...</option>';
    selectLocalidad.disabled = true;
    return;
  }

  selectLocalidad.disabled = true;
  selectLocalidad.innerHTML = '<option value="">Cargando municipios...</option>';

  const municipios = await obtenerMunicipiosPorProvincia(provinciaElegida);
  selectLocalidad.innerHTML = '<option value="">Seleccione su localidad...</option>';

  municipios.forEach(mun => {
    const opt = document.createElement('option');
    opt.value = mun;
    opt.textContent = mun;
    selectLocalidad.appendChild(opt);
  });

  selectLocalidad.disabled = false;
}

// Manejador del autocompletado en tiempo real estilo Google Maps
async function manejarAutocompletadoCalle(e) {
  const texto = e.target.value.trim();
  if (!sugerenciasCalleList) return;

  if (texto.length < 3) {
    sugerenciasCalleList.classList.remove('active');
    sugerenciasCalleList.innerHTML = '';
    return;
  }

  const sugerencias = await buscarDireccionesCalles(texto);

  if (sugerencias.length === 0) {
    sugerenciasCalleList.classList.remove('active');
    return;
  }

  sugerenciasCalleList.innerHTML = '';
  sugerencias.forEach(calle => {
    const li = document.createElement('li');
    li.classList.add('autocomplete-item');
    li.textContent = calle;

    li.addEventListener('click', () => {
      inputDireccion.value = calle;
      sugerenciasCalleList.classList.remove('active');
    });

    sugerenciasCalleList.appendChild(li);
  });

  sugerenciasCalleList.classList.add('active');
}

function mostrarToast(mensaje) {
  if (!toastContainer) return;
  const toast = document.createElement('div');
  toast.classList.add('toast');
  toast.textContent = mensaje;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function renderizarProductos(listaProductos) {
  if (!productosContainer) return;
  productosContainer.innerHTML = '';

  if (listaProductos.length === 0) {
    productosContainer.innerHTML = `<p class="spinner">No se encontraron productos.</p>`;
    if (totalResultsText) totalResultsText.textContent = '0 productos encontrados';
    return;
  }

  if (totalResultsText) totalResultsText.textContent = `Mostrando ${listaProductos.length} productos`;

  listaProductos.forEach(prod => {
    const card = document.createElement('article');
    card.classList.add('card-producto');

    card.innerHTML = `
      <div class="card-producto__img-wrapper" style="cursor:pointer;">
        <img src="${prod.image}" alt="${prod.title}" class="card-producto__img">
      </div>
      <div>
        <h3 class="card-producto__title" style="cursor:pointer;">${prod.title}</h3>
        <p class="card-producto__price">$${prod.price.toFixed(2)}</p>
      </div>
      <button class="btn-add-cart">Añadir al Carrito</button>
    `;

    const imgWrapper = card.querySelector('.card-producto__img-wrapper');
    const titleEl = card.querySelector('.card-producto__title');
    const btnAdd = card.querySelector('.btn-add-cart');

    if (imgWrapper) imgWrapper.addEventListener('click', () => abrirModalProducto(prod));
    if (titleEl) titleEl.addEventListener('click', () => abrirModalProducto(prod));

    if (btnAdd) {
      btnAdd.addEventListener('click', (e) => {
        e.stopPropagation();
        agregarAlCarrito(prod);
        mostrarToast(`Añadido: ${prod.title.slice(0, 20)}...`);
      });
    }

    productosContainer.appendChild(card);
  });
}

function abrirModalProducto(prod) {
  if (!productModalContent) return;
  productModalContent.innerHTML = `
    <div class="modal-product__img-wrapper">
      <img src="${prod.image}" alt="${prod.title}" class="modal-product__img">
    </div>
    <div>
      <h3 class="modal-product__title">${prod.title}</h3>
      <div class="modal-product__rating">★ ${prod.rating?.rate || '4.5'} (${prod.rating?.count || 100} valoraciones)</div>
      <p class="modal-product__desc">${prod.description}</p>
      <p class="modal-product__price">$${prod.price.toFixed(2)}</p>
      <button id="btn-add-modal" class="btn-primary" style="width:100%;">Agregar al Carrito</button>
    </div>
  `;

  const btnAddModal = document.getElementById('btn-add-modal');
  if (btnAddModal) {
    btnAddModal.addEventListener('click', () => {
      agregarAlCarrito(prod);
      mostrarToast(`Añadido: ${prod.title.slice(0, 20)}...`);
      toggleModalSafe(productModal, productModalOverlay, false);
    });
  }

  toggleModalSafe(productModal, productModalOverlay, true);
}

function renderizarCategorias(categorias) {
  if (!categoriasContainer) return;
  categorias.forEach(cat => {
    const btn = document.createElement('button');
    btn.classList.add('btn-categoria');
    btn.dataset.category = cat;
    btn.textContent = cat;

    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-categoria').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      categoriaSeleccionada = cat;
      filtrarYRenderizar();
      toggleModalSafe(sidebarMenu, sidebarOverlay, false);
    });

    categoriasContainer.appendChild(btn);
  });

  const btnAll = document.querySelector('[data-category="all"]');
  if (btnAll) {
    btnAll.addEventListener('click', (e) => {
      document.querySelectorAll('.btn-categoria').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      categoriaSeleccionada = 'all';
      filtrarYRenderizar();
      toggleModalSafe(sidebarMenu, sidebarOverlay, false);
    });
  }
}

function filtrarYRenderizar() {
  let resultado = [...listaProductosGlobal];

  if (categoriaSeleccionada !== 'all') {
    resultado = resultado.filter(p => p.category === categoriaSeleccionada);
  }

  if (inputBusqueda) {
    const busqueda = inputBusqueda.value.trim().toLowerCase();
    if (busqueda !== '') {
      resultado = resultado.filter(p => p.title.toLowerCase().includes(busqueda));
    }
  }

  if (selectOrden) {
    const orden = selectOrden.value;
    if (orden === 'price-asc') {
      resultado.sort((a, b) => a.price - b.price);
    } else if (orden === 'price-desc') {
      resultado.sort((a, b) => b.price - a.price);
    }
  }

  renderizarProductos(resultado);
}

function actualizarInterfazCarrito() {
  if (cartCounter) cartCounter.textContent = contarUnidadesTotales();
  if (!cartItemsContainer) return;
  cartItemsContainer.innerHTML = '';

  if (carrito.length === 0) {
    cartItemsContainer.innerHTML = '<p style="text-align:center; color: var(--text-muted); margin-top:2rem;">El carrito está vacío.</p>';
  } else {
    carrito.forEach(item => {
      const div = document.createElement('div');
      div.classList.add('cart-item');

      div.innerHTML = `
        <div class="cart-item__img-wrapper">
          <img src="${item.image}" alt="${item.title}" class="cart-item__img">
        </div>
        <div class="cart-item__content">
          <h4 class="cart-item__title">${item.title}</h4>
          <p class="cart-item__price">$${item.price.toFixed(2)}</p>
          <div class="cart-item__actions">
            <div class="cart-item__controls">
              <button class="cart-item__btn btn-restar">-</button>
              <span class="cart-item__qty">${item.cantidad}</span>
              <button class="cart-item__btn btn-sumar">+</button>
            </div>
            <button class="cart-item__remove-btn btn-eliminar">🗑</button>
          </div>
        </div>
      `;

      div.querySelector('.btn-restar').addEventListener('click', () => cambiarCantidad(item.id, -1));
      div.querySelector('.btn-sumar').addEventListener('click', () => cambiarCantidad(item.id, 1));
      div.querySelector('.btn-eliminar').addEventListener('click', () => {
        eliminarDelCarrito(item.id);
        mostrarToast('Producto eliminado');
      });

      cartItemsContainer.appendChild(div);
    });
  }

  if (cartTotalPrice) cartTotalPrice.textContent = `$${calcularTotalCarrito().toFixed(2)}`;
}

function actualizarSidebarUsuario() {
  if (!sidebarUserContainer) return;
  const usuarioActivo = typeof obtenerUsuarioActivo === 'function' ? obtenerUsuarioActivo() : null;

  if (usuarioActivo) {
    sidebarUserContainer.innerHTML = `
      <div class="user-logged-info">
        <p>Hola, <strong>${usuarioActivo.nombre}</strong></p>
        <button id="btn-logout" class="btn-logout">Cerrar Sesión</button>
      </div>
    `;

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        if (typeof cerrarSesion === 'function') cerrarSesion();
        actualizarSidebarUsuario();
        mostrarToast('Sesión cerrada');
      });
    }
  } else {
    sidebarUserContainer.innerHTML = `
      <button id="btn-login-sidebar" class="user-btn-sidebar">
        👤 Iniciar Sesión / Registrarse
      </button>
    `;

    const btnLoginSidebar = document.getElementById('btn-login-sidebar');
    if (btnLoginSidebar) {
      btnLoginSidebar.addEventListener('click', () => {
        toggleModalSafe(sidebarMenu, sidebarOverlay, false);
        toggleModalSafe(authModal, authModalOverlay, true);
      });
    }
  }
}

function configurarEventosGlobales() {
  if (btnMenu) btnMenu.addEventListener('click', () => toggleModalSafe(sidebarMenu, sidebarOverlay, true));
  if (closeSidebar) closeSidebar.addEventListener('click', () => toggleModalSafe(sidebarMenu, sidebarOverlay, false));
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', () => toggleModalSafe(sidebarMenu, sidebarOverlay, false));

  if (btnCarrito) btnCarrito.addEventListener('click', () => toggleModalSafe(cartModal, cartOverlay, true));
  if (closeCart) closeCart.addEventListener('click', () => toggleModalSafe(cartModal, cartOverlay, false));
  if (cartOverlay) cartOverlay.addEventListener('click', () => toggleModalSafe(cartModal, cartOverlay, false));

  if (closeProductModal) closeProductModal.addEventListener('click', () => toggleModalSafe(productModal, productModalOverlay, false));
  if (productModalOverlay) productModalOverlay.addEventListener('click', () => toggleModalSafe(productModal, productModalOverlay, false));

  if (closeAuthModal) closeAuthModal.addEventListener('click', () => toggleModalSafe(authModal, authModalOverlay, false));
  if (authModalOverlay) authModalOverlay.addEventListener('click', () => toggleModalSafe(authModal, authModalOverlay, false));

  if (closeCheckoutModal) closeCheckoutModal.addEventListener('click', () => toggleModalSafe(checkoutModal, checkoutModalOverlay, false));
  if (checkoutModalOverlay) checkoutModalOverlay.addEventListener('click', () => toggleModalSafe(checkoutModal, checkoutModalOverlay, false));

  if (inputBusqueda) inputBusqueda.addEventListener('input', filtrarYRenderizar);
  if (selectOrden) selectOrden.addEventListener('change', filtrarYRenderizar);

  if (selectProvincia) selectProvincia.addEventListener('change', manejarCambioProvincia);
  if (inputDireccion) inputDireccion.addEventListener('input', manejarAutocompletadoCalle);

  // Ocultar sugerencias si se hace clic fuera del input de dirección
  document.addEventListener('click', (e) => {
    if (sugerenciasCalleList && e.target !== inputDireccion) {
      sugerenciasCalleList.classList.remove('active');
    }
  });

  if (inputTarjeta) {
    inputTarjeta.addEventListener('input', (e) => {
      let valor = e.target.value.replace(/\D/g, '');
      valor = valor.replace(/(\d{4})/g, '$1 ').trim();
      e.target.value = valor;
    });
  }

  if (tabLogin && tabRegister && formLogin && formRegister) {
    tabLogin.addEventListener('click', () => {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      formLogin.classList.add('active');
      formRegister.classList.remove('active');
    });

    tabRegister.addEventListener('click', () => {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      formRegister.classList.add('active');
      formLogin.classList.remove('active');
    });
  }

  if (formRegister) {
    formRegister.addEventListener('submit', (e) => {
      e.preventDefault();
      const res = registrarUsuario(
        document.getElementById('reg-nombre').value,
        document.getElementById('reg-email').value,
        document.getElementById('reg-telefono').value,
        document.getElementById('reg-password').value
      );
      mostrarToast(res.mensaje);
      if (res.exito) {
        actualizarSidebarUsuario();
        toggleModalSafe(authModal, authModalOverlay, false);
        formRegister.reset();
      }
    });
  }

  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      const res = iniciarSesion(
        document.getElementById('login-email').value,
        document.getElementById('login-password').value
      );
      mostrarToast(res.mensaje);
      if (res.exito) {
        actualizarSidebarUsuario();
        toggleModalSafe(authModal, authModalOverlay, false);
        formLogin.reset();
      }
    });
  }

  if (btnVaciar) {
    btnVaciar.addEventListener('click', () => {
      if (carrito.length > 0 && confirm('¿Deseas vaciar el carrito?')) {
        vaciarCarrito();
        mostrarToast('Carrito vaciado');
      }
    });
  }

  if (btnCheckout) {
    btnCheckout.addEventListener('click', () => {
      if (carrito.length === 0) {
        mostrarToast('Tu carrito está vacío');
        return;
      }

      const usuarioActivo = obtenerUsuarioActivo();

      if (!usuarioActivo) {
        mostrarToast('Debes iniciar sesión para completar tu compra');
        toggleModalSafe(cartModal, cartOverlay, false);
        toggleModalSafe(authModal, authModalOverlay, true);
        return;
      }

      const inputNombre = document.getElementById('nombre');
      const inputEmail = document.getElementById('email');
      if (inputNombre) inputNombre.value = usuarioActivo.nombre;
      if (inputEmail) inputEmail.value = usuarioActivo.email;

      if (checkoutTotalPrice) checkoutTotalPrice.textContent = `$${calcularTotalCarrito().toFixed(2)}`;
      toggleModalSafe(cartModal, cartOverlay, false);
      toggleModalSafe(checkoutModal, checkoutModalOverlay, true);
    });
  }

  checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputNombre = document.getElementById('nombre');
    const nombre = inputNombre ? inputNombre.value : '';
    vaciarCarrito();
    toggleModalSafe(checkoutModal, checkoutModalOverlay, false);
    checkoutForm.reset();
    mostrarToast(`¡Gracias ${nombre}! Compra procesada con éxito 🎉`);
  });
}