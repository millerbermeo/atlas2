document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = 'https://172.16.1.26:8734/Dashboard/Dashboard/api_agentes.php';
    const apiUrlPost = 'https://172.16.1.26:8734/Dashboard/Dashboard/api_table.php';

    const formulario = document.getElementById('formulario');
    const tablaBody = document.getElementById('tabla-body');
    let descargar = document.getElementById('descargar');

    descargar.addEventListener("click", ()=> {
        const filasTabla = document.querySelectorAll('#tabla-body tr');
        if (filasTabla.length === 0) {
            alert("La tabla está vacía. No hay datos para descargar.");
            return; // No hay datos, no continúes con la descarga
        }
    
        // Crear un array para almacenar los datos del CSV
        const datosCSV = [];
    
        // Iterar sobre las filas de la tabla
        filasTabla.forEach(fila => {
            const datosFila = [];
    
            // Obtener las celdas de cada fila
            const celdasFila = fila.querySelectorAll('td');
    
            // Iterar sobre las celdas de la fila
            celdasFila.forEach(celda => {
                datosFila.push(celda.textContent);
            });
    
            // Agregar los datos de la fila al array principal
            datosCSV.push(datosFila.join(','));
        });
    
        // Crear el contenido del CSV
        const contenidoCSV = datosCSV.join('\n');
    
        // Crear un Blob y un enlace de descarga
        const blob = new Blob([contenidoCSV], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
    
        const a = document.createElement('a');
        a.href = url;
        a.download = 'datos_tabla.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    
        window.URL.revokeObjectURL(url);
    })

    const selectContainer = document.getElementById('content-select');
    

    // Realizar la solicitud GET utilizando fetch
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`La solicitud falló con código ${response.status}`);
            }
            return response.json();
        })
        .then(data => {


            const selectElement = document.createElement('select');
            selectElement.id = 'select-agentes';
            selectElement.classList.add('form-select'); // Agrega la clase de Bootstrap
            selectElement.style.width = "100%"
            selectElement.style.height = "34px"
            selectElement.style.outline = "none"
            selectElement.style.border = "1px solid #ccc"

            const todosVacio = document.createElement('option');
            todosVacio.value = '';
            todosVacio.text = '';
            selectElement.appendChild(todosVacio);

            const todosOption = document.createElement('option');
            todosOption.value = 'Todos';
            todosOption.text = 'Todos';
            selectElement.appendChild(todosOption);

            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.cola;
                option.text = item.name;
                selectElement.appendChild(option);
            });

            selectContainer.appendChild(selectElement);
        })
        .catch(error => {
            console.error('Error durante la solicitud:', error);
        });

    formulario.addEventListener("submit", (e) => {
        e.preventDefault();
        let inputFecha = document.getElementById('fecha').value;
        let inputSelect = document.getElementById('select-agentes').value;

        console.log(inputFecha);
        console.log(inputSelect);

        const formData = new FormData();

        // Agregar datos al FormData sin comillas
        formData.append('agente', inputSelect);
        formData.append('fecha', inputFecha);

        // Limpiar el contenido actual de la tabla antes de agregar nuevas filas
        tablaBody.innerHTML = '';

        fetch(apiUrlPost, {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`La solicitud falló con código ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Iterar sobre los datos y agregar filas a la tabla
                data.forEach(item => {

             

               
                        document.getElementById("show-table").style.display="block"
                 

                    const fila = document.createElement('tr');
                    fila.classList.add('table-row'); // Agrega la clase de Bootstrap

                    // Asegurarse de que las claves que obtienes coincidan con las que esperas
                    const keys = ['name', 'queue', 'total_campañas', 'total_llamadas_completadas', 'total_llamadas'];

                    keys.forEach(key => {
                        const celda = document.createElement('td');
                        celda.textContent = item[key];
                        celda.classList.add('table-cell'); // Agrega la clase de Bootstrap
                        fila.appendChild(celda);
                    });

                    tablaBody.appendChild(fila);

                    
                });
            })
            .catch(error => {
                console.error('Error durante la solicitud:', error);
            });
    });
});
