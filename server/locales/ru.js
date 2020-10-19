module.exports = {
  translation: {
    appName: 'Менеджер задач',
    validation: {
      mustBeUnique: '',
      users: {
        wrongPassword: 'Пароль указан неверно',
        passwordsMustBeEqual: 'Пароли должны совпадать',
        passwordLenght: 'Длина пароля должна быть не менее четырёх символов',
        nameLength: 'Имя должно состоять как минимум из двух символов',
        invalidEmail: 'Невалидный email',
      },
      taskStatuses: {
        nameLength: 'Название должно состоять как минимум из трёх символов',
      },
      tags: {
        nameLength: 'Название должно состоять как минимум из двух символов',
      },
      tasks: {
        nameLength: 'Название должно состоять как минимум из трёх символов',
      },
    },
    flash: {
      session: {
        create: {
          success: 'Вы залогинены',
          error: 'Неправильный email или пароль',
        },
        delete: {
          success: 'Вы разлогинены',
        },
      },
      users: {
        create: {
          success: 'Пользователь успешно зарегистрирован',
          error: 'Не удалось зарегистрировать пользователя',
        },
        patch: {
          success: 'Данные пользователя успешно обновлены',
          error: 'Не удалось обновить данные пользователя',
        },
        delete: {
          success: 'Пользователь успешно удалён',
          error: 'Чтобы удалить пользователя нужно удалить все созданные им задачи',
        },
      },
      taskStatuses: {
        create: {
          success: 'Статус успешно создан',
          error: 'Не удалось создать статус',
        },
        patch: {
          success: 'Название статуса успешно обновлено',
          error: 'Не удалось обновить название статуса',
        },
        delete: {
          success: 'Статус успешно удалён',
          error: 'Чтобы удалить статус, нужно чтобы им не были отмечены никакие задачи',
        },
      },
      tags: {
        create: {
          success: 'Тег успешно создан',
          error: 'Не удалось создать тег',
        },
        patch: {
          success: 'Название тега успешно обновлено',
          error: 'Не удалось обновить название тега',
        },
        delete: {
          success: 'Тег успешно удалён',
          error: 'Чтобы удалить тег, нужно чтобы им не были отмечены никакие задачи',
        },
      },
      tasks: {
        create: {
          success: 'Задача успешно создана',
          error: 'Не удалось создать задачу',
        },
        patch: {
          success: 'Задача успешно обновлена',
          error: 'Не удалось обновить задачу',
        },
        delete: {
          success: 'Задача успешно удалена',
        },
        mustExist: 'Сущность должна существовать',
      },
    },
    layouts: {
      application: {
        users: 'Пользователи',
        taskStatuses: 'Статусы',
        tags: 'Теги',
        tasks: 'Задачи',
        logIn: 'Вход',
        signUp: 'Регистрация',
        logOut: 'Выход',
      },
    },
    views: {
      requiredField: 'Обязятельное поле',
      session: {
        email: 'Email',
        password: 'Пароль',
        new: {
          title: 'Форма входа',
          submit: 'Войти',
        },
      },
      users: {
        id: 'ID',
        email: 'Email',
        createdAt: 'Дата создания',
        updatedAt: 'Дата обновления',
        firstName: 'Имя',
        lastName: 'Фамилия',
        fullName: 'Имя и фамилия',
        password: 'Пароль',
        noUsers: 'Пользователей пока нет',
        new: {
          submit: 'Зарегистрировать',
          title: 'Форма регистрации',
        },
        edit: {
          title: 'Настройки пользователя',
          information: 'Информация о пользователе',
          newPassword: 'Новый пароль',
          currentPassword: 'Текущий пароль',
          confirmPassword: 'Подтверждение пароля',
          deleteUser: 'Удалить пользователя',
          submit: 'Сохранить',
        },
      },
      taskStatuses: {
        id: 'ID',
        statusName: 'Название статуса',
        editStatus: 'Редактировать',
        delete: 'Удалить',
        createdAt: 'Дата создания',
        actions: 'Действия',
        addStatus: 'Создать новый статус',
        edit: {
          title: 'Редактирование статуса',
          submit: 'Сохранить',
          deleteStatus: 'Удалить статус',
        },
        new: {
          title: 'Создание статуса',
          submit: 'Создать',
        },
      },
      tags: {
        id: 'ID',
        tagName: 'Название тега',
        editTag: 'Редактировать',
        delete: 'Удалить',
        createdAt: 'Дата создания',
        actions: 'Действия',
        addTag: 'Создать новый тег',
        edit: {
          title: 'Редактирование тега',
          submit: 'Сохранить',
          deleteTag: 'Удалить тег',
        },
        new: {
          title: 'Создание тега',
          submit: 'Создать',
        },
      },
      tasks: {
        id: 'ID',
        taskName: 'Название задачи',
        description: 'Описание',
        fullName: 'Имя и фамилия',
        assignedTo: 'Исполнитель',
        creator: 'Автор',
        status: 'Статус',
        tags: 'Теги',
        createdAt: 'Дата создания',
        updatedAt: 'Дата обновления',
        addTask: 'Создать новую задачу',
        submit: 'Показать',
        myTasks: 'Только мои задачи',
        noTasks: 'Задач пока нет',
        edit: {
          title: 'Редактирование задачи',
          submit: 'Сохранить',
          deleteTask: 'Удалить задачу',
        },
        new: {
          title: 'Создание задачи',
          submit: 'Создать',
        },
      },
      welcome: {
        index: {
          title: 'Добро пожаловать в Менеджер Задач!',
          lead: 'Наше приложение поможет вам легко и удобно организовать работу вашей команды.',
          description: 'Ещё никогда выполнять план не было так легко и увлекательно! Присоединяйтесь к нам и все ваши цели будут достигнуты!',
          isMember: 'Уже зарегистрированы?',
        },
      },
      401: {
        title: 'Вам нужно зайти под своей учётной записью',
      },
      403: {
        title: 'Не достаточно прав, чтобы зайти на эту страницу',
      },
      404: {
        title: 'Страница не найдена',
      },
      500: {
        title: 'Критическая ошибка на сервере',
      },
    },
  },
};
