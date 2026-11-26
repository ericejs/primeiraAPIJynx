const API_DEFAULT = "https://primeiraapijynx.onrender.com";
    const API_STORAGE_KEY = "jynx.apiBase";
    const SESSION_KEY = "jynx.loggedInEmail";
    let apiBase = localStorage.getItem(API_STORAGE_KEY) || API_DEFAULT;
    let users = [];
    let authMode = "login";
    let toastTimer;

    const byId = (id) => document.getElementById(id);
    const authScreen = byId("auth-screen");
    const app = byId("app");
    const authForm = byId("auth-form");
    const authName = byId("auth-name");
    const authAge = byId("auth-age");
    const authEmail = byId("auth-email");
    const authPassword = byId("auth-password");
    const authError = byId("auth-error");
    const userDialog = byId("user-dialog");
    const userForm = byId("user-form");
    const toast = byId("toast");

    function showToast(message, isError = false) {
      window.clearTimeout(toastTimer);
      toast.textContent = message;
      toast.classList.toggle("error", isError);
      toast.hidden = false;
      toastTimer = window.setTimeout(() => { toast.hidden = true; }, 4200);
    }

    function setApiStatus(state, message) {
      const status = byId("api-status");
      status.classList.remove("online", "offline");
      if (state) status.classList.add(state);
      byId("api-status-text").textContent = message;
    }

    function normalizedBase() {
      return apiBase.replace(/\/+$/, "");
    }

    async function apiRequest(path, options = {}) {
      let response;
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 60000);
      try {
        response = await fetch(`${normalizedBase()}${path}`, {
          method: options.method || "GET",
          headers: options.body ? { "Content-Type": "application/json" } : {},
          body: options.body ? JSON.stringify(options.body) : undefined,
          cache: "no-store",
          signal: controller.signal
        });
      } catch (error) {
        if (error.name === "AbortError") throw new Error("A API demorou para responder. Tente novamente.");
        throw new Error("Não foi possível conectar à API. Verifique o endereço, o servidor e o CORS.");
      } finally {
        window.clearTimeout(timeout);
      }

      const text = await response.text();
      let payload = text;
      if (text) {
        try { payload = JSON.parse(text); } catch { /* respostas de texto também são válidas */ }
      }
      if (!response.ok) {
        const detail = payload && typeof payload === "object" ? payload.message : payload;
        throw new Error(detail || `A API respondeu com erro ${response.status}.`);
      }
      return payload;
    }

    async function testApi() {
      setApiStatus("", "Verificando API");
      try {
        await apiRequest("/");
        setApiStatus("online", "API conectada");
        return true;
      } catch (error) {
        setApiStatus("offline", "API indisponível");
        return false;
      }
    }

    function setAuthMode(mode) {
      authMode = mode;
      const registering = mode === "register";
      byId("auth-eyebrow").textContent = registering ? "Novo cadastro" : "Área de acesso";
      byId("auth-title").textContent = registering ? "Crie sua conta" : "Boas-vindas";
      byId("auth-description").textContent = registering
        ? "Informe seus dados para criar um usuário na base."
        : "Entre com seu e-mail e senha para acessar a gestão de usuários.";
      byId("auth-submit").textContent = registering ? "Criar conta" : "Entrar";
      byId("auth-toggle").textContent = registering ? "Já tem cadastro? Entrar" : "Ainda não tem cadastro? Criar conta";
      byId("auth-name-field").hidden = !registering;
      byId("auth-age-field").hidden = !registering;
      authName.required = registering;
      authAge.required = registering;
      authPassword.autocomplete = registering ? "new-password" : "current-password";
      authError.textContent = "";
    }

    function initials(name) {
      return String(name || "?").trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join("").toUpperCase() || "?";
    }

    function updateMetrics() {
      const ages = users.map((user) => Number(user.age)).filter((age) => Number.isFinite(age) && age >= 0);
      byId("metric-total").textContent = String(users.length);
      byId("metric-average").textContent = ages.length ? `${Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length)} anos` : "—";
      byId("metric-adults").textContent = String(ages.filter((age) => age >= 18).length);
      byId("users-subtitle").textContent = `${users.length} ${users.length === 1 ? "registro encontrado" : "registros encontrados"}`;
    }

    function createCell(text, className) {
      const cell = document.createElement("td");
      if (className) cell.className = className;
      cell.textContent = text;
      return cell;
    }

    function renderUsers() {
      const body = byId("users-body");
      const query = byId("user-search").value.trim().toLocaleLowerCase("pt-BR");
      const filtered = users.filter((user) =>
        `${user.name || ""} ${user.email || ""}`.toLocaleLowerCase("pt-BR").includes(query)
      );
      body.replaceChildren();

      if (!filtered.length) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 4;
        cell.className = "empty-state";
        const title = document.createElement("strong");
        title.textContent = query ? "Nenhum usuário encontrado" : "Sua lista está vazia";
        const description = document.createElement("span");
        description.textContent = query ? "Tente buscar por outro nome ou e-mail." : "Adicione o primeiro usuário para começar.";
        cell.append(title, description);
        row.append(cell);
        body.append(row);
        return;
      }

      filtered.forEach((user) => {
        const row = document.createElement("tr");
        const person = document.createElement("td");
        const personWrap = document.createElement("div");
        personWrap.className = "person-cell";
        const avatar = document.createElement("span");
        avatar.className = "avatar";
        avatar.textContent = initials(user.name);
        const details = document.createElement("div");
        const name = document.createElement("div");
        name.className = "person-name";
        name.textContent = user.name || "Sem nome";
        const email = document.createElement("div");
        email.className = "person-email";
        email.textContent = user.email || "Sem e-mail";
        details.append(name, email);
        personWrap.append(avatar, details);
        person.append(personWrap);

        const age = createCell(Number.isFinite(Number(user.age)) ? `${user.age} anos` : "—");
        const idCell = document.createElement("td");
        const idChip = document.createElement("span");
        idChip.className = "id-chip";
        idChip.textContent = `#${user.id}`;
        idCell.append(idChip);

        const actions = document.createElement("td");
        const actionWrap = document.createElement("div");
        actionWrap.className = "row-actions";
        const edit = document.createElement("button");
        edit.type = "button";
        edit.textContent = "Editar";
        edit.setAttribute("aria-label", `Editar ${user.name || "usuário"}`);
        edit.addEventListener("click", () => openUserDialog(user));
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "delete";
        remove.textContent = "Excluir";
        remove.setAttribute("aria-label", `Excluir ${user.name || "usuário"}`);
        remove.addEventListener("click", () => deleteUser(user));
        actionWrap.append(edit, remove);
        actions.append(actionWrap);
        row.append(person, age, idCell, actions);
        body.append(row);
      });
    }

    async function loadUsers() {
      const refreshButton = byId("refresh-users");
      if (refreshButton) refreshButton.disabled = true;
      try {
        const result = await apiRequest("/users/get");
        if (!Array.isArray(result)) throw new Error("A resposta da API não contém uma lista de usuários.");
        users = result;
        updateMetrics();
        renderUsers();
      } finally {
        if (refreshButton) refreshButton.disabled = false;
      }
    }

    function openApp(email) {
      authScreen.hidden = true;
      app.hidden = false;
      byId("account-email").textContent = email;
      byId("account-avatar").textContent = initials(email.split("@")[0]);
      byId("welcome-name").textContent = email.split("@")[0];
      testApi();
      loadUsers().catch((error) => showToast(error.message, true));
    }

    function logout() {
      sessionStorage.removeItem(SESSION_KEY);
      app.hidden = true;
      authScreen.hidden = false;
      authForm.reset();
      setAuthMode("login");
    }

    function openUserDialog(user) {
      userForm.reset();
      const editing = Boolean(user);
      byId("dialog-title").textContent = editing ? "Editar usuário" : "Adicionar usuário";
      byId("dialog-description").textContent = editing
        ? "Atualize os dados e informe uma nova senha para salvar."
        : "Preencha os dados para cadastrar na base.";
      byId("save-user-btn").textContent = editing ? "Salvar alterações" : "Cadastrar usuário";
      byId("password-label-note").textContent = editing ? "(nova senha obrigatória)" : "";
      byId("user-id").value = editing ? user.id : "";
      byId("user-name").value = editing ? user.name || "" : "";
      byId("user-email").value = editing ? user.email || "" : "";
      byId("user-age").value = editing ? user.age ?? "" : "";
      byId("user-password").required = true;
      userDialog.showModal();
      byId("user-name").focus();
    }

    async function deleteUser(user) {
      const name = user.name || user.email || `#${user.id}`;
      if (!window.confirm(`Excluir ${name} da base? Esta ação não pode ser desfeita.`)) return;
      try {
        const result = await apiRequest("/users/delete", { method: "DELETE", body: { id: user.id } });
        if (!Array.isArray(result) || result.length === 0) throw new Error("Usuário não encontrado; a lista não foi alterada.");
        await loadUsers();
        showToast("Usuário excluído com sucesso.");
      } catch (error) {
        showToast(error.message, true);
      }
    }

    byId("auth-toggle").addEventListener("click", () => setAuthMode(authMode === "login" ? "register" : "login"));
    authForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      authError.textContent = "";
      const submit = byId("auth-submit");
      submit.disabled = true;
      try {
        const email = authEmail.value.trim();
        const password = authPassword.value;
        if (authMode === "register") {
          const age = Number(authAge.value);
          if (!Number.isInteger(age) || age < 0 || age > 150) throw new Error("Informe uma idade válida entre 0 e 150.");
          await apiRequest("/users/post", {
            method: "POST",
            body: { name: authName.value.trim(), age, email, password }
          });
          setAuthMode("login");
          authEmail.value = email;
          authPassword.value = "";
          showToast("Conta criada. Agora entre com seu e-mail e senha.");
        } else {
          const result = await apiRequest("/login", {
            method: "POST",
            body: { email, password }
          });
          if (typeof result !== "string" || result.trim().toLocaleLowerCase("pt-BR") !== "autorizado") {
            throw new Error(typeof result === "string" ? result : "Não foi possível validar o login.");
          }
          sessionStorage.setItem(SESSION_KEY, email);
          openApp(email);
        }
      } catch (error) {
        if (authMode === "login") authError.textContent = error.message;
        else authError.textContent = error.message;
      } finally {
        submit.disabled = false;
      }
    });

    [byId("new-user-btn"), byId("welcome-new-user"), byId("card-new-user")].forEach((button) => {
      button.addEventListener("click", () => openUserDialog());
    });
    byId("close-dialog").addEventListener("click", () => userDialog.close());
    byId("cancel-dialog").addEventListener("click", () => userDialog.close());
    userDialog.addEventListener("click", (event) => {
      if (event.target === userDialog) userDialog.close();
    });
    userForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submit = byId("save-user-btn");
      submit.disabled = true;
      const data = new FormData(userForm);
      const id = data.get("id");
      const age = Number(data.get("age"));
      const body = {
        name: String(data.get("name")).trim(),
        age,
        email: String(data.get("email")).trim(),
        password: String(data.get("password"))
      };
      try {
        if (!Number.isInteger(age) || age < 0 || age > 150) throw new Error("Informe uma idade válida entre 0 e 150.");
        if (id) {
          const result = await apiRequest("/users/put", { method: "PUT", body: { id, ...body } });
          if (!Array.isArray(result) || result.length === 0) throw new Error("Usuário não encontrado; nenhuma alteração foi aplicada.");
        } else {
          await apiRequest("/users/post", { method: "POST", body });
        }
        userDialog.close();
        await loadUsers();
        showToast(id ? "Usuário atualizado com sucesso." : "Usuário cadastrado com sucesso.");
      } catch (error) {
        showToast(error.message, true);
      } finally {
        submit.disabled = false;
      }
    });

    byId("user-search").addEventListener("input", renderUsers);
    byId("api-settings-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const input = byId("api-url");
      let parsed;
      try { parsed = new URL(input.value.trim()); } catch {
        showToast("Informe um endereço válido para a API.", true);
        return;
      }
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        showToast("O endereço da API deve usar HTTP ou HTTPS.", true);
        return;
      }
      apiBase = parsed.origin + parsed.pathname.replace(/\/+$/, "");
      localStorage.setItem(API_STORAGE_KEY, apiBase);
      input.value = apiBase;
      byId("settings").open = false;
      const connected = await testApi();
      if (connected) {
        showToast("Endereço salvo. API conectada.");
        if (!app.hidden) loadUsers().catch((error) => showToast(error.message, true));
      } else {
        showToast("Endereço salvo, mas a API não respondeu. Verifique o servidor e o CORS.", true);
      }
    });

    byId("logout-btn").addEventListener("click", logout);
    byId("quick-logout").addEventListener("click", logout);

    byId("api-url").value = apiBase;
    setAuthMode("login");
    testApi();
    const savedEmail = sessionStorage.getItem(SESSION_KEY);
    if (savedEmail) openApp(savedEmail);
  