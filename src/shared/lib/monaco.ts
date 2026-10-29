// Monaco грузим из локального бандла: дефолтный загрузчик @monaco-editor/react
// тянет редактор с cdn.jsdelivr.net, который из РФ недоступен — редактор
// навсегда зависал в «Loading...». Импорт этого модуля (side-effect) до
// монтирования <Editor /> переключает loader на локальный экземпляр.
import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';

self.MonacoEnvironment = {
  getWorker(_workerId: string, label: string): Worker {
    if (label === 'json') return new jsonWorker();
    return new editorWorker();
  },
};

loader.config({ monaco });
