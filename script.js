const API_TOKEN = window.DATO_TOKEN;
const API_URL = "https://graphql.datocms.com/";

let allEvents = [];
let currentlyDisplayedEvents = 0;
const eventsPerLoad = 5;

async function fetchEvents() {
  const query = `
    query EventsQuery($today: DateTime!) {
      allEvents(
        filter: {
          cancelled: { eq: false },
          private: { eq: false },
          startDate: { gte: $today }
        },
        orderBy: startDate_ASC,
        first: 100
      ) {
        id
        title
        startDate
        endDate
        slug
      }
    }
  `;

  const today = new Date().toISOString();

  try {
    console.log("Fetching events from Dato CMS...");
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
        "X-Environment": "main",
      },
      body: JSON.stringify({
        query,
        variables: { today },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error("GraphQL query failed: " + JSON.stringify(data.errors));
    }

    if (!data.data || !data.data.allEvents) {
      throw new Error("Unexpected data structure");
    }

    return data.data.allEvents;
  } catch (error) {
    console.error("Error in fetchEvents:", error);
    throw error;
  }
}

function formatDate(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const formatOptions = { weekday: "long", month: "long", day: "numeric" };
  const timeFormatOptions = { hour: "numeric", minute: "2-digit" };

  let formattedDate = start.toLocaleDateString("en-US", formatOptions);
  formattedDate += ", " + start.toLocaleTimeString("en-US", timeFormatOptions);

  if (endDate) {
    if (start.toDateString() === end.toDateString()) {
      formattedDate +=
        " - " + end.toLocaleTimeString("en-US", timeFormatOptions);
    } else {
      formattedDate += " - " + end.toLocaleDateString("en-US", formatOptions);
      formattedDate +=
        ", " + end.toLocaleTimeString("en-US", timeFormatOptions);
    }
  }

  return formattedDate;
}

function renderEvents(events, startIndex = 0, count = eventsPerLoad) {
  const eventsContainer = document.getElementById("events-container");
  const endIndex = Math.min(startIndex + count, events.length);

  const eventsList = events
    .slice(startIndex, endIndex)
    .map(
      (event) => `
    <div class="event-item mb-8 ">
      <h4 class="text-lg font-bold mb-0 text-stone-200">${event.title}</h4>
      <p class="text-md text-stone-400 mb-2">
        ${formatDate(event.startDate, event.endDate)}
      </p>
    </div>
  `
    )
    .join("");

  if (startIndex === 0) {
    eventsContainer.innerHTML = eventsList;
  } else {
    eventsContainer.insertAdjacentHTML("beforeend", eventsList);
  }

  currentlyDisplayedEvents = endIndex;
}

function createLoadMoreButton() {
  const loadMoreButton = document.createElement("button");
  loadMoreButton.id = "load-more-button";
  loadMoreButton.className =
    "mt-4 px-4 py-2 bg-orange-soda opacity-80 text-white rounded-full hover:opacity-100 mx-auto";
  loadMoreButton.textContent = "More…";
  loadMoreButton.onclick = loadMoreEvents;

  const eventsContainer = document.getElementById("events-container");
  eventsContainer.parentNode.insertBefore(
    loadMoreButton,
    eventsContainer.nextSibling
  );
}

function updateLoadMoreButton() {
  const loadMoreButton = document.getElementById("load-more-button");
  if (loadMoreButton) {
    if (currentlyDisplayedEvents < allEvents.length) {
      loadMoreButton.style.display = "block";
    } else {
      loadMoreButton.style.display = "none";
    }
  }
}

function loadMoreEvents() {
  renderEvents(allEvents, currentlyDisplayedEvents);
  updateLoadMoreButton();
}

function showLoading() {
  const eventsContainer = document.getElementById("events-container");
  eventsContainer.innerHTML =
    '<p class="text-center text-gray-600">Loading events...</p>';
}

function showError(message) {
  const eventsContainer = document.getElementById("events-container");
  eventsContainer.innerHTML = `<p class="text-center text-red-600">Error: ${message}</p>`;
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM content loaded, fetching events...");
  showLoading();
  try {
    allEvents = await fetchEvents();
    renderEvents(allEvents);
    createLoadMoreButton();
    updateLoadMoreButton();
  } catch (error) {
    console.error("Error in main execution:", error);
    showError("Failed to load events. Please try again later.");
  }
});
