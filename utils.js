export function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

export function playAnimation(element, animName) {
  element.className = "";
  window.requestAnimationFrame(function(time) {
    window.requestAnimationFrame(function(time) {
      element.className = animName;
    });
  });
}
