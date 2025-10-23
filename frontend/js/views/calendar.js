import { auth } from "../auth.js";

export function calendar() {
  return `
<div class="dashboard-layout">
  <!-- Sidebar -->
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
      <a href="#" class="sidebar-logo" data-route="dashboard">
        <i class="fas fa-graduation-cap"></i>
        <span>LearnPoint</span>
      </a>
    </div>

    <nav class="sidebar-nav">
      <a href="#" class="sidebar-nav-item" data-route="dashboard">
        <i class="fas fa-home"></i>
        <span>Dashboard</span>
      </a>
      <a href="#" class="sidebar-nav-item active" data-route="calendar">
        <i class="fas fa-calendar-alt"></i>
        <span>Calendar</span>
      </a>
      <a href="#" class="sidebar-nav-item" data-route="chats">
        <i class="fas fa-comments"></i>
        <span>Chats</span>
      </a>
      <button class="sidebar-nav-item" id="logoutBtn">
        <i class="fas fa-sign-out-alt"></i>
        <span>Logout</span>
      </button>
    </nav>
  </aside>

  <!-- Main content -->
  <main class="main-content">
    <section class="section">
      <div class="container">
        <h1 class="title has-text-centered">Tutoring Calendar</h1>
        <p class="subtitle has-text-centered">Manage and join your tutoring sessions</p>
      </div>
    </section>

    <div id="calendar" class="calendar-full box"></div>
  </main>
</div>

<!-- Tutoring Modal -->
<div id="tutoringModal" class="modal">
  <div class="modal-background"></div>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title" id="modalTitle"></p>
      <button class="delete" aria-label="close"
        onclick="document.getElementById('tutoringModal').classList.remove('is-active')"></button>
    </header>
    <section class="modal-card-body">
      <div class="field">
        <label class="label">Student</label>
        <div class="control">
          <div class="select is-fullwidth">
            <select id="modalStudent"></select>
          </div>
        </div>
      </div>
      <div class="field">
        <label class="label">Subject</label>
        <div class="control">
          <div class="select is-fullwidth">
            <select id="modalSubject"></select>
          </div>
        </div>
      </div>
      <div class="field">
        <label class="label">Start</label>
        <div class="control">
          <input class="input" type="datetime-local" id="modalStart" />
        </div>
      </div>
      <div class="field">
        <label class="label">End</label>
        <div class="control">
          <input class="input" type="datetime-local" id="modalEnd" />
        </div>
      </div>
      <!-- 📌 Nuevo campo para mostrar el link -->
      <div class="field" id="jitsiLinkField" style="display:none;">
        <label class="label">Jitsi Meeting</label>
        <p>
          <a id="jitsiLinkDisplay" href="#" target="_blank" class="button is-small is-link">Join Jitsi 🖥️</a>
        </p>
      </div>
    </section>
    <footer class="modal-card-foot">
      <button id="modalSaveBtn" class="button is-success">Save</button>
      <button id="modalDeleteBtn" class="button is-danger is-hidden">Delete</button>
      <button class="button"
        onclick="document.getElementById('tutoringModal').classList.remove('is-active')">Cancel</button>
    </footer>
  </div>
</div>

<!-- Error Modal -->
<div id="errorModal" class="modal">
  <div class="modal-background"></div>
  <div class="modal-content has-text-centered">
    <div class="box p-6" style="max-width: 400px; margin: auto;">
      <button class="delete is-large modal-close" aria-label="close"
        style="position: absolute; top: 15px; right: 15px; transform: scale(1.5);"></button>
      <p id="errorModalMessage" class="has-text-danger has-text-weight-semibold is-size-5"></p>
    </div>
  </div>
</div>

<!-- Confirm Modal -->
<div id="confirmModal" class="modal">
  <div class="modal-background"></div>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Confirm Action</p>
      <button class="delete modal-close" aria-label="close"></button>
    </header>
    <section class="modal-card-body">
      <p id="confirmModalMessage">Are you sure?</p>
    </section>
    <footer class="modal-card-foot">
      <button id="confirmYesBtn" class="button is-danger">Yes</button>
      <button class="button modal-close">Cancel</button>
    </footer>
  </div>
</div>

<link href="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.css" rel="stylesheet" />
<script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js"></script>
`;
}

export async function initCalendar() {
  const user = auth.getUser();
  if (!user) {
    showErrorModal("You must log in first.");
    window.location.hash = "#/login";
    return;
  }

  const calendarEl = document.getElementById("calendar");

  function showErrorModal(message) {
    const modal = document.getElementById("errorModal");
    document.getElementById("errorModalMessage").textContent = message;
    modal.classList.add("is-active");
    modal.querySelectorAll(".modal-close, .modal-background").forEach((el) => {
      el.onclick = () => modal.classList.remove("is-active");
    });
  }

  function showConfirmModal(message, onConfirm) {
    const modal = document.getElementById("confirmModal");
    document.getElementById("confirmModalMessage").textContent = message;
    modal.classList.add("is-active");
    const yesBtn = document.getElementById("confirmYesBtn");
    const closeModal = () => modal.classList.remove("is-active");
    yesBtn.onclick = () => {
      onConfirm();
      closeModal();
    };
    modal.querySelectorAll(".modal-close, .modal-background, .button.modal-close").forEach((el) => {
      el.onclick = closeModal;
    });
  }

  function formatToMySQLDateTime(dateStr) {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
  }

  function populateModalSelects(students, subjects) {
    const studentSelect = document.getElementById("modalStudent");
    const subjectSelect = document.getElementById("modalSubject");
    studentSelect.innerHTML = '<option value="">Select a student</option>';
    subjectSelect.innerHTML = '<option value="">Select a subject</option>';
    students.forEach((s) => {
      const o = document.createElement("option");
      o.value = s.id;
      o.textContent = s.name;
      studentSelect.appendChild(o);
    });
    subjects.forEach((s) => {
      const o = document.createElement("option");
      o.value = s.id;
      o.textContent = s.subject_name;
      subjectSelect.appendChild(o);
    });
  }

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "timeGridWeek",
    locale: "en",
    timeZone: "local",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    },
    selectable: user.role === "tutor",
    editable: user.role === "tutor",

    selectAllow(info) {
      const now = new Date();
      return info.start >= now;
    },

    events: async (fetchInfo, success, fail) => {
      try {
        const res = await fetch(
          `http://localhost:3000/calendar/events?userId=${
            user.role === "tutor" ? user.tutorId : user.studentId
          }&role=${user.role}`
        );
        const data = await res.json();
        success(
          data.map((e) => ({
            id: e.id,
            title: `${e.subject_name} with ${e.student_name || "TBD"}`,
            start: e.start_time || e.start,
            end: e.end_time || e.end,
            extendedProps: e,
          }))
        );
      } catch (err) {
        console.error(err);
        fail(err);
      }
    },

    eventContent(arg) {
      const link = arg.event.extendedProps.jitsi_link;
      const jitsiButton = link
        ? `<a href="${link}" target="_blank" class="button is-small is-link mt-1">Join Jitsi 🖥️</a>`
        : "";
      return {
        html: `
          <div style="font-size:0.8em; line-height:1.2; text-align:center;">
            <div style="font-weight:bold;">${arg.event.title}</div>
            ${jitsiButton}
          </div>
        `,
      };
    },

    select: async (info) => {
      if (user.role !== "tutor") return;

      const students = await fetchStudents();
      const subjects = await fetchSubjects();
      populateModalSelects(students, subjects);

      document.getElementById("modalTitle").textContent = "Create Tutoring Session";
      document.getElementById("modalStart").value = info.start.toISOString().slice(0, 16);
      document.getElementById("modalEnd").value = info.end.toISOString().slice(0, 16);
      document.getElementById("jitsiLinkField").style.display = "none";

      document.getElementById("modalSaveBtn").onclick = async () => {
        const studentId = document.getElementById("modalStudent").value;
        const subjectId = document.getElementById("modalSubject").value;
        if (!studentId || !subjectId) {
          showErrorModal("Please select student and subject.");
          return;
        }

        const jitsiLink = `https://meet.jit.si/tutoria-${Date.now()}`;
        const body = {
          start_datetime: formatToMySQLDateTime(info.start),
          end_datetime: formatToMySQLDateTime(info.end),
          tutors_id: user.tutorId,
          students_id: Number(studentId),
          subjects_id: Number(subjectId),
          jitsi_link: jitsiLink,
        };

        const res = await fetch("http://localhost:3000/calendar/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (res.ok) {
          document.getElementById("tutoringModal").classList.remove("is-active");
          calendar.addEvent({
            title: `${subjects.find((s) => s.id == subjectId).subject_name} with ${
              students.find((s) => s.id == studentId).name
            }`,
            start: info.start,
            end: info.end,
            extendedProps: {
              jitsi_link: jitsiLink,
              subjects_id: subjectId,
              students_id: studentId,
            },
          });
        } else {
          showErrorModal("Error creating tutoring session");
        }
      };

      document.getElementById("tutoringModal").classList.add("is-active");
    },
  });

  calendar.render();

  async function fetchStudents() {
    const res = await fetch("http://localhost:3000/users/role/students");
    return res.ok ? await res.json() : [];
  }

  async function fetchSubjects() {
    const res = await fetch("http://localhost:3000/subjects");
    return res.ok ? await res.json() : [];
  }
}

export function loadCalendarView() {
  document.getElementById("main").innerHTML = calendar();
  initCalendar();
}
