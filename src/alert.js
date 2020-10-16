

var snackbar = {
    // Displays a snackbar notification in the lower portion of the screen
    async alert(text, timeout, color){
    color = color || "#4caf50"
    var x = document.getElementById("snackbar");
    x.innerHTML = text;
    x.className = "show";
    x.style.backgroundColor = color;
    timeout = (timeout === undefined) ? 3000 : timeout;
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, timeout);
  }
}

export default snackbar;