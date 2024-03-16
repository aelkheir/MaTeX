import { Question } from "../entities/Question";
import { app, ipcMain } from "electron";
import path from "path";
import { readFileSync, writeFile } from "fs";
import Handlebars from "handlebars";
import { spawn } from "child_process";
import tmp from "tmp";

export const setUpExamApi = () => {
  ipcMain.handle("create-exam", createExam);
};

const createExam = async (
  _: Electron.IpcMainInvokeEvent,
  selections: Set<number>
) => {
  let orderBy = "(case";
  for (const questionId of selections.values()) {
    orderBy += ` when id = ${questionId} then ${questionId}`;
  }
  orderBy += " else null end)";

  const repository = Question.getRepository();
  const questions = repository
    .createQueryBuilder("question")
    .where("id IN(:...ids)", { ids: [...selections.values()] })
    .orderBy(orderBy)
    .getMany();

  return create("title", questions);
};

const create = (title: string, questions: Promise<Question[]>) => {
  const templatePath = app.isPackaged
    ? path.join(process.resourcesPath, "exam.hbs")
    : path.join("exam.hbs");
  const templateStr = readFileSync(templatePath).toString();

  const template = Handlebars.compile(templateStr, {
    noEscape: true,
    strict: true,
    preventIndent: true,
  });

  return new Promise((resolve, reject) => {
    questions.then((questions) => {
      const result = template({ questions, title });

      tmp.dir(
        { prefix: "MaTeX", unsafeCleanup: true },
        function _tempDirCreated(err, tempDirPath, dirCleanup) {
          if (err) reject("something went wrong: can't create temp dir");
          const LATEX_FILE_NAME = "exam.tex";

          tmp.file(
            { name: LATEX_FILE_NAME, dir: tempDirPath, keep: true },
            (err, texFilePath, fd, texFileCleanup) => {
              if (err) {
                if (err) {
                  texFileCleanup();
                  dirCleanup();
                  reject("something went wrong: couldn't create .tex file");
                }
              }

              writeFile(texFilePath, result, (err) => {
                if (err) {
                  texFileCleanup();
                  dirCleanup();
                  reject("something went wrong: couldn't write to .tex file");
                }

                let output = "";
                const latex = spawn(
                  "latexmk",
                  [
                    "-pdf",
                    "-halt-on-error",
                    "-interaction=nonstopmode",
                    `-output-directory=${tempDirPath}`,
                    LATEX_FILE_NAME,
                    `-jobname=exam`,
                  ],
                  { shell: true, cwd: tempDirPath }
                );
                latex.stderr.on("data", (chunk) => {
                  output += chunk.toString();
                });
                latex.stderr.pipe(process.stderr);

                latex.on("exit", (code, signal) => {
                  console.log("exit", code, signal);
                  console.log("\n\n\n", result);

                  if (code === 0) {
                    const pdf = readFileSync(tempDirPath + "/exam.pdf");

                    texFileCleanup();
                    dirCleanup();
                    resolve(pdf);
                  }
                  texFileCleanup();
                  dirCleanup();
                  reject(output);
                });

                latex.on("error", (err) => {
                  texFileCleanup();
                  dirCleanup();
                  reject(
                    "something went wrong: latex failed make sure it is installed and on path"
                  );
                });

                latex.on("disconnect", () => {
                  texFileCleanup();
                  dirCleanup();
                  reject("something went wrong: disconnected");
                });
              });
            }
          );
        }
      );
    });
  });
};
