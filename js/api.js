/**
 * MÓDULO API REST (js/api.js)
 */
const BASE_URL = 'https://fakestoreapi.com';
const GEOREF_URL = 'https://apis.datos.gob.ar/georef/api';

async function obtenerProductos() {
  try {
    const respuesta = await fetch(`${BASE_URL}/products`);
    if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);
    return await respuesta.json();
  } catch (error) {
    console.error("Fallo al obtener productos:", error);
    return [];
  }
}

async function obtenerCategorias() {
  try {
    const respuesta = await fetch(`${BASE_URL}/products/categories`);
    if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);
    return await respuesta.json();
  } catch (error) {
    console.error("Fallo al obtener categorías:", error);
    return [];
  }
}

async function obtenerProvinciasArgentina() {
  try {
    const respuesta = await fetch(`${GEOREF_URL}/provincias`);
    if (!respuesta.ok) throw new Error("Error en Georef");
    const datos = await respuesta.json();
    return datos.provincias.map(p => p.nombre).sort();
  } catch (error) {
    console.error("Fallo al obtener provincias:", error);
    return ["Buenos Aires", "Ciudad Autónoma de Buenos Aires", "Córdoba", "Santa Fe", "Mendoza"];
  }
}

async function obtenerMunicipiosPorProvincia(nombreProvincia) {
  try {
    const respuesta = await fetch(`${GEOREF_URL}/municipios?provincia=${encodeURIComponent(nombreProvincia)}&max=100`);
    if (!respuesta.ok) throw new Error("Error obteniendo municipios");
    const datos = await respuesta.json();
    return datos.municipios.map(m => m.nombre).sort();
  } catch (error) {
    console.error("Fallo al obtener municipios:", error);
    return ["Capital", "Zona Centro", "Zona Norte", "Zona Sur"];
  }
}

/**
 * Consulta la API Georef para sugerir nombres de calles según lo que escribe el usuario
 */
async function buscarDireccionesCalles(texto) {
  if (!texto || texto.length < 3) return [];
  try {
    const respuesta = await fetch(`${GEOREF_URL}/calles?nombre=${encodeURIComponent(texto)}&max=5`);
    if (!respuesta.ok) return [];
    const datos = await respuesta.json();
    return datos.calles.map(c => `${c.nombre}, ${c.provincia.nombre}`);
  } catch (error) {
    return [];
  }
}