document.addEventListener('DOMContentLoaded', function () {
    const urlEndpoint = 'https://172.16.1.26:8734/Dashboard/Dashboard/api_colas.php';
    const urlEndpoint2 = 'https://172.16.1.26:8734/Dashboard/Dashboard/api_campañas.php';
    const selectColas = document.getElementById("selectColas");
    const chartsContainer = document.getElementById("chartsContainer");

    fetch(urlEndpoint, {
        method: "GET"
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            const opcionVacia = document.createElement('option');
            opcionVacia.textContent = 'Selecciona una opción'; // Mensaje que se mostrará
            selectColas.appendChild(opcionVacia);

            const opcionTodas = document.createElement('option');
            opcionTodas.value = 'Todas';
            opcionTodas.textContent = 'Todas';
            selectColas.appendChild(opcionTodas);

            data.forEach(cola => {
                const opcion = document.createElement('option');
                opcion.value = cola.cola;
                opcion.textContent = cola.cola;
                selectColas.appendChild(opcion);
            });
        })
        .catch(error => {
            console.error('Error al realizar la solicitud:', error);
        });

        selectColas.addEventListener("change", function () {
            const valorSeleccionado = selectColas.value;
        
            const formData = new FormData();
            formData.append("cola", valorSeleccionado);
        
            fetch(urlEndpoint2, {
                method: "POST",
                body: formData
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error en la solicitud: ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(apiDataArray => {
                    // Limpiar los gráficos anteriores
                    chartsContainer.innerHTML = '';
        
                    // Filtrar datos por estado
                    const estadoA = apiDataArray.filter(apiData => apiData.estado === 'A');
                    const estadoI = apiDataArray.filter(apiData => apiData.estado === 'I');
                    const estadoT = apiDataArray.filter(apiData => apiData.estado === 'T');
        
                    // Agregar evento change al selectEstado
                    selectEstado.addEventListener("change", function () {
                        const estadoSeleccionado = selectEstado.value;
        
                        // Limpiar los gráficos anteriores
                        chartsContainer.innerHTML = '';
        
                        // Filtrar datos por estado seleccionado
                        const estadoSeleccionadoData = apiDataArray.filter(apiData => apiData.estado === estadoSeleccionado);
        
                        // Generar gráficos para el estado seleccionado
                        generarGraficoPorEstado(estadoSeleccionadoData, estadoSeleccionado);
                    });
        
                    // Establecer el valor predeterminado del selectEstado a "Inactivo"
                    selectEstado.value = 'I';
        
                    // Desencadenar manualmente el evento change para mostrar las gráficas inactivas por defecto
                    selectEstado.dispatchEvent(new Event('change'));
                })
                .catch(error => {
                    console.error('Error al realizar la solicitud:', error);
                });
        });

    // Agregar contenedor para cada estado
    function agregarContenedorEstado(estado) {
        const contenedor = document.createElement('div');
        contenedor.classList.add('estado-container'); // Estilo opcional
        contenedor.innerHTML = `<h2>Estado ${estado}</h2>`;
        chartsContainer.appendChild(contenedor);
        return contenedor;
    }

    // Generar gráfico por estado
    function generarGraficoPorEstado(data, estado) {
        const estadoContainer = agregarContenedorEstado(estado);

        data.forEach(apiData => {
            // Verificar si las propiedades necesarias no son null
            if (apiData.llamadas_completadas !== null && apiData.total_llamadas !== null) {
                const chartContainer = agregarContenedorGrafico(estadoContainer);
                const chartData = {
                    labels: ["Completadas", "Total"],
                    // labels: [`Completadas ${apiData.llamadas_completadas}`, `Total ${apiData.total_llamadas}`],
                    datasets: [{
                        label: `Estadísticas - ${estado}`,
                        backgroundColor: ["rgba(75, 192, 192, 0.2)", "rgba(255, 99, 132, 0.2)"],
                        borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
                        borderWidth: 1,
                        data: [
                            parseInt(apiData.llamadas_completadas),
                            parseInt(apiData.total_llamadas)
                        ]
                    }]
                };
                agregarGraficoAlContenedor(chartContainer, chartData);
                agregarInfoAdicional(chartContainer, apiData);
            }
        });
    }

    // Agregar contenedor para cada gráfico
    function agregarContenedorGrafico(estadoContainer) {
        const contenedor = document.createElement('div');
        contenedor.classList.add('chart-container'); // Estilo opcional
        estadoContainer.appendChild(contenedor);

        contenedor.style.position="relative"
        contenedor.style.marginBottom="100px"
        contenedor.style.marginTop="20px"
        // contenedor.style.border="1px solid red"

        const textoContainer = document.createElement('div');
        textoContainer.classList.add('texto-container'); // Clase para el contenedor de texto
        textoContainer.style.position="absolute"
        textoContainer.style.right="-40%"
        textoContainer.style.top="20%"
        
        contenedor.appendChild(textoContainer);

        return contenedor;
    }

    // Agregar gráfico al contenedor
    function agregarGraficoAlContenedor(contenedor, chartData) {
        const canvas = document.createElement('canvas');
        contenedor.appendChild(canvas);
        contenedor.style.display = "flex";

        const ctx = canvas.getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: chartData
        });

        // Agregar texto horizontal en el contenedor de texto
        const textoContainer = contenedor.querySelector('.texto-container');
        textoContainer.innerHTML = `
            <p>Llamadas Completadas: ${chartData.datasets[0].data[0]}</p>
            <p>Total de Llamadas: ${chartData.datasets[0].data[1]}</p>
        `;
    }

    // Agregar información adicional debajo de cada gráfico
    function agregarInfoAdicional(contenedor, apiData) {
        const infoContainer = document.createElement('div');
        infoContainer.classList.add('info-container'); // Clase para el contenedor de información adicional
        infoContainer.style.position = "absolute"
        infoContainer.style.bottom = "-50%"
        contenedor.appendChild(infoContainer);

        infoContainer.innerHTML = `
            <p>Campaña: <span style="font-size: 14px">${apiData.nombre_campaña}</span></p>
            <p>Fecha de Inicio: ${apiData.fecha_inicio}</p>
            <p>Fecha de Fin: ${apiData.fecha_fin}</p>
        `;
    }
});
