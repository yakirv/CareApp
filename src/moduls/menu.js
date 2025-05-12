export class Menu {
    menuIcon;
    actions;
  
    constructor() {
      document.addEventListener("DOMContentLoaded", () => {
        this.menuIcon = document.getElementById("menu-icon");
        this.actions = document.getElementById("actions");
        this.initializeMenu();
      });
    }
    initializeMenu() {
      this.openMenu();
      this.closeMenu();
    }
    openMenu() {
      this.menuIcon.addEventListener("click", (e) => {
        e.stopPropagation();
        if (actions.style.visibility == "hidden") {
          this.actions.style.visibility = "visible";
          this.actions.style.opacity = "1";
          this.actions.style.zIndex = "99";
        } else {
          this.actions.style.visibility = "hidden";
          this.actions.style.opacity = "0";
        }
      });
    }
  
    closeMenu() {
      document.documentElement.addEventListener("click", () => {
        this.actions.style.visibility = "hidden";
        this.actions.style.opacity = "0";
      });
    }
  }