console.log(`Let's write some JavaScript`);

let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}
async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];

    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  // Show all the songs in the playlist
  let songUL = document.querySelector(".songList ul");
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML += `<li> <img src="Svgs/music.svg" alt="music" />
        <div class="info">
          <div> ${song.replaceAll("%20", " ")}</div>
          <div>harry</div>
        </div>
        <div class="playnow" >
          <span>Play Now</span>
          <img src="Svgs/play.svg" alt="play" />
        </div> </li>
        `;
  }

  // Attach an event listener to each song

  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      playSong(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  return songs;
}

const playSong = (track, pause = false) => {
  // let audio = new Audio("/songs/" + track);
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "Svgs/pause.svg";
  }

  document.querySelector(".songname").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = `00:00 /00:00`;
};

async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:3000/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[0];

      // get the metadata of the folder
      let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
      let response = await a.json();
      cardContainer.innerHTML += `            <div data-folder="${folder}" class="card">
              <div class="play">
                <i class="fa-solid fa-play" style="color: #000"></i>
              </div>
              <img
                src="/songs/${folder}/cover.jpg"s
                alt="" />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`;
    }
  }

  // load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);

      playSong(songs[0]);
    });
  });
}
async function main() {
  // get the list of all songs

  await getSongs(`songs/BollywoodAcoustic`);
  playSong(songs[0], true);

  //display all the albums on the page
  await displayAlbums();

  // attach event listner to  play

  document.getElementById("play").addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "Svgs/pause.svg";
    } else {
      currentSong.pause();
      play.src = "Svgs/play.svg";
    }
  });

  // add an event listener to previous
  document.getElementById("previous").addEventListener("click", () => {
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playSong(songs[index - 1]);
    }
  });
  // add an event listener to next

  document.getElementById("next").addEventListener("click", () => {
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playSong(songs[index + 1]);
    }
  });

  // listen for time uptade event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // add an event listener to seek bar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";

    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // add an event listner for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  // add an event listner for close
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // add an event to volume

  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
      if (currentSong.volume > 0) {
        document.querySelector(".volume>img").src = document
          .querySelector(".volume>img")
          .src.replace("Svgs/mute.svg", "Svgs/volume.svg");
      }
    });

  // add event listener to mute the track
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("Svgs/volume.svg")) {
      e.target.src = e.target.src.replace("Svgs/volume.svg", "Svgs/mute.svg");
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("Svgs/mute.svg", "Svgs/volume.svg");
      currentSong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
}

main();
