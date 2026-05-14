(function() {
    // Adiciona o HTML do loader dinamicamente se não existir
    if (!document.getElementById('loader')) {
        const loaderHTML = `
            <div id="loader">
                <div class="loader-container">
                    <img id="loader-img" src="" alt="Loading...">
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('afterbegin', loaderHTML);
    }

    const loader = document.getElementById('loader');
    const loaderImg = document.getElementById('loader-img');
    let currentFrame = 1;

    // Função para detectar o caminho das imagens (considerando subpastas)
    const getImagePath = (frame) => {
        const path = window.location.pathname;
        // Se estiver em uma subpasta (contém /pages/), volta dois níveis
        const isSubpage = path.includes('/pages/');
        const prefix = isSubpage ? '../../img/' : 'img/';
        return `${prefix}reload_${frame}.png`;
    };

    // Inicia o loop de imagens
    const interval = setInterval(() => {
        currentFrame = (currentFrame % 8) + 1;
        loaderImg.src = getImagePath(currentFrame);
    }, 100);

    // Remove o loader quando a página terminar de carregar
    window.addEventListener('load', () => {
        // Pequeno delay para garantir uma transição suave
        setTimeout(() => {
            loader.classList.add('fade-out');
            clearInterval(interval);
            
            // Remove do DOM após a transição para não interferir
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }, 600);
    });
})();
