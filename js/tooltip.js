

function showTooltip(evt, file) {
    var myTooltip = document.getElementById("my-tooltip");

    myTooltip.style.left = (evt.clientX + 20) + "px";
    myTooltip.style.top = (window.scrollY + evt.clientY - 20) + "px";
    myTooltip.style.display = "block";

    const htmlList = Object.keys(file).map(key => {
        return `<li>${key} - ${file[key]}</li>`
    }).join('')
    myTooltip.innerHTML = `
    <div><h4><b>${file.name}</b></h2></div>
    <div><ul>${htmlList}</ul></div>
    `
}

function hideTooltip(evt) {
    var myTooltip = document.getElementById("my-tooltip");
    myTooltip.style.display = "none";
}

export { showTooltip, hideTooltip };