export function setUpSettings() {
    const navLayoutNotes = document.querySelectorAll(".navLayout-toggle");
    navLayoutNotes.forEach((note) => {
        note.addEventListener("click", () => {
            changeNavlayout(note);
        })
    })
}

export function changeNavlayout(note) {
    const navNotes = document.querySelectorAll(".nav-notes");
    navNotes.forEach((notes) => {
        notes.style.display = "flex"
    }) 
    switch (note.textContent) {
        case "Square":
            navNotes.forEach((notes) => {
                notes.style.display = "grid"
                notes.style.gridTemplateColumns = "1fr 1fr"
                notes.style.rowGap = "20px"
            }) 
        break;
        case "Sideways":
        navNotes.forEach((notes) => {
            notes.style.flexDirection = "row"
        }) 
        break;
        case "Down":
        navNotes.forEach((notes) => {
            notes.style.flexDirection = "column"
        }) 
        break;
    }
}