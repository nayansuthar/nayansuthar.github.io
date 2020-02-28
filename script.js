var createPills = function (pillsEl, onChange) {
  var pills = pillsEl.querySelectorAll (".pills__item");
  var allPill = pillsEl.querySelector (".pills__item[data-type='all']");  
  
  var pillClick = function (targetPill) {
    // Reset all other pills if the target is All
    if (targetPill == allPill) {
      pills.forEach (function (p) {
        p.setAttribute ("data-selected", "false");
      });
      targetPill.setAttribute ("data-selected", "true");
      // Deselect targetPill if already selected
    } else if (targetPill.getAttribute("data-selected") == "true") {
      targetPill.setAttribute ("data-selected", "false");      
    } else {
      allPill.setAttribute ("data-selected", "false");
      targetPill.setAttribute ("data-selected", "true");
    }
    
    var selectedValues = [];
    pillsEl.querySelectorAll (".pills__item[data-selected='true']").forEach (function (p) {
      selectedValues.push (p.innerText);
    });
    
    // Set All Pill of no pill is selected
    if (selectedValues.length == 0) {
      selectedValues.push (allPill.innerText);
      allPill.setAttribute ("data-selected", "true");
    };
    onChange (selectedValues);
  }
  
  // Add events to all pills
  pills.forEach (function (p) {
    p.addEventListener ("click", function (ev) {
      pillClick (ev.target);
    }, false);
  });  
}

createPills (document.getElementById ("filter-pills"), function (selectedPills) {
  console.log (selectedPills);
});