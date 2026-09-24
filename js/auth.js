/**
 * MÓDULO DE AUTENTICACIÓN Y VALIDACIONES (js/auth.js)
 */
const USERS_STORAGE_KEY = 'techstore_users_v1';
const ACTIVE_USER_KEY = 'techstore_active_user_v1';

function obtenerUsuariosRegistrados() {
  const usuarios = localStorage.getItem(USERS_STORAGE_KEY);
  return usuarios ? JSON.parse(usuarios) : [];
}

function guardarUsuariosRegistrados(usuarios) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usuarios));
}

function registrarUsuario(nombre, email, telefono, password) {
  const usuarios = obtenerUsuariosRegistrados();
  const existe = usuarios.some(u => u.email.toLowerCase() === email.trim().toLowerCase());
  
  if (existe) {
    return { exito: false, mensaje: 'Ya existe una cuenta asociada a este correo electrónico.' };
  }

  const nuevoUsuario = {
    id: Date.now(),
    nombre: nombre.trim(),
    email: email.trim().toLowerCase(),
    telefono: telefono.trim(),
    password: password
  };

  usuarios.push(nuevoUsuario);
  guardarUsuariosRegistrados(usuarios);
  establecerUsuarioActivo(nuevoUsuario);

  return { exito: true, mensaje: 'Cuenta creada con éxito.' };
}

function iniciarSesion(email, password) {
  const usuarios = obtenerUsuariosRegistrados();
  const emailLimpio = email.trim().toLowerCase();

  // 1. Verificar si el correo existe en LocalStorage
  const usuarioExistente = usuarios.find(u => u.email.toLowerCase() === emailLimpio);

  if (!usuarioExistente) {
    return { exito: false, mensaje: 'No existe ninguna cuenta registrada con este correo electrónico.' };
  }

  // 2. Verificar la contraseña asociada
  if (usuarioExistente.password !== password) {
    return { exito: false, mensaje: 'Contraseña incorrecta. Verifique sus datos.' };
  }

  establecerUsuarioActivo(usuarioExistente);
  return { exito: true, mensaje: `¡Bienvenido/a, ${usuarioExistente.nombre}!`, usuario: usuarioExistente };
}

function establecerUsuarioActivo(usuario) {
  const datosSesion = { id: usuario.id, nombre: usuario.nombre, email: usuario.email };
  localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(datosSesion));
}

function obtenerUsuarioActivo() {
  const activo = localStorage.getItem(ACTIVE_USER_KEY);
  return activo ? JSON.parse(activo) : null;
}

function cerrarSesion() {
  localStorage.removeItem(ACTIVE_USER_KEY);
}