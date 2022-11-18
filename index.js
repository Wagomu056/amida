function addName() {
  const nameTextElement = document.getElementById("nameText");
  const nameText = nameTextElement.value;

  if (nameText !== "") {
    p = document.createElement('p');
    p.appendChild(document.createTextNode(nameText));

    const nameList = document.getElementById("nameList");
    nameList.classList.add("name_item");
    nameList.appendChild(p);

    nameTextElement.value = '';
    nameTextElement.focus();
  }
}

function goAmida() {
  const nameList = document.getElementById("nameList");
  names = nameList.children;
  if (names.length === 0) {
    return;
  }

  path = 'amida.html?';
  for (let i = 0; i < names.length; i++) {
    console.log(names[i].textContent);
    path += 'name' + i + '=' + names[i].textContent;

    if (i !== names.length - 1) {
      path += '&';
    }
  }
  console.log(path);

  window.location.href = path;
}