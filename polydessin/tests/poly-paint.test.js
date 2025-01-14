import PolyPaint from "../src/poly-paint";
import Pencil from "../src/pencil";
import loadCanvas from "../src/canvas-loader";
import { jest } from "@jest/globals";

describe("PolyPaint tests", () => {
  let toolStub;
  let polyPaint;

  beforeEach(() => {
    toolStub = {
      name: "toolStub",
      onMouseDown: () => { },
      onMouseMove: () => { },
      onMouseUp: () => { },
      changeWidth: () => { },
      changeColor: () => { },
    };
    const canvas = document.createElement("canvas");
    canvas.setAttribute("id", "base-canvas");
    const widthInput = document.createElement("input");
    widthInput.setAttribute("id", "input-width");
    const colorInput = document.createElement("input");
    colorInput.setAttribute("id", "input-color");
    document.body.appendChild(canvas);
    document.body.appendChild(widthInput);
    document.body.appendChild(colorInput);

    polyPaint = new PolyPaint(canvas, [toolStub]);
    polyPaint.attachListeners();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should create a new PolyPaint object", () => {
    expect(polyPaint).toBeTruthy();
    expect(polyPaint.currentTool).toEqual(toolStub);
  });

  describe("Mouse Events", () => {
    it("should call onMouseDown method of the Tool on a mouse down event", () => {
      const mouseEventSpy = jest.spyOn(polyPaint.currentTool, "onMouseDown").mockImplementation(() => { });
      polyPaint.canvas.dispatchEvent(new MouseEvent("mousedown")); // simulation d'un événement
      expect(mouseEventSpy).toBeCalled();
    });

    it("should call onMouseUp method of the Tool on a mouse up event", () => {
      const mouseEventSpy = jest.spyOn(polyPaint.currentTool, "onMouseUp").mockImplementation(() => { });
      polyPaint.canvas.dispatchEvent(new MouseEvent("mouseup"));
      expect(mouseEventSpy).toBeCalled();
    });

    it("should call onMouseMove method of the Tool on a mouse move event", () => {
      const mouseEventSpy = jest.spyOn(polyPaint.currentTool, "onMouseMove").mockImplementation(() => { });
      polyPaint.canvas.dispatchEvent(new MouseEvent("mousemove"));
      expect(mouseEventSpy).toBeCalled();
    });
  });

  describe("Change Events", () => {
    it("should call changeWidth method of the Tool on a valid width change", () => {
      const changeEventSpy = jest.spyOn(polyPaint.currentTool, "changeWidth").mockImplementation(() => { });
      const input = document.getElementById("input-width");
      input.value = 10;
      input.dispatchEvent(new Event("change"));
      expect(changeEventSpy).toBeCalled();
    });

    it("should not call changeWidth method of the Tool on an invalid width change", () => {
      const changeEventSpy = jest.spyOn(polyPaint.currentTool, "changeWidth").mockImplementation(() => { });
      const input = document.getElementById("input-width");
      input.value = 12;
      input.dispatchEvent(new Event("change"));
      expect(changeEventSpy).not.toBeCalled();
    });

    it("should call changeColor method of the Tool on a valid color change", () => {
      const changeEventSpy = jest.spyOn(polyPaint.currentTool, "changeColor").mockImplementation(() => { });
      const input = document.getElementById("input-color");
      input.value = "#00ff00";
      input.dispatchEvent(new Event("change"));
      expect(changeEventSpy).toBeCalled();
    });

    it("should not call changeColor method of the Tool on an invalid color change", () => {
      const changeEventSpy = jest.spyOn(polyPaint.currentTool, "changeColor").mockImplementation(() => { });
      const input = document.getElementById("input-color");
      input.value = "allo";
      input.dispatchEvent(new Event("change"));
      expect(changeEventSpy).not.toBeCalled();
    });
  });

  describe("Helper Functions", () => {
    it("inputValidator should return true if value is between min and max", () => {
      expect(polyPaint.inputValidator(5, 0, 10)).toBeTruthy();
    });

    it("inputValidator should return false if value is under min", () => {
      expect(polyPaint.inputValidator(-5, 0, 10)).toBeFalsy();
    });

    it("inputValidator should return false if value is over max", () => {
      expect(polyPaint.inputValidator(15, 0, 10)).toBeFalsy();
    });

    it("colorValidator should return true if input is an valid color", () => {
      expect(polyPaint.colorValidator("#0000ff")).toBeTruthy();
    });

    it("colorValidator should return false if input is an invalid color", () => {
      expect(polyPaint.colorValidator("#rrggbb")).toBeFalsy();
    });
  });

  describe("Integration and System Tests", () => {

    function configureEvent(type, x, y) {
      const event = new MouseEvent(type);
      [event.offsetX, event.offsetY] = [x, y];
      return event;
    }

    // Test d'intégration
    it('Should change the color of the tool', () => {
      // Besoin d'un vrai objet Pencil
      polyPaint.currentTool = new Pencil('pencil', 1, polyPaint.canvas.getContext('2d'));
      const color = "#00ff00";
      const input = document.getElementById("input-color");
      input.value = color;
      input.dispatchEvent(new Event("change"));
      expect(polyPaint.currentTool.color).toBe(color);
    });

    // Test de système
    it('Should modify canvas after drawing', () => {

      // Construire les classes nécessaires
      const drawingCanvas = loadCanvas();
      const pencil = new Pencil("pencil", 5, drawingCanvas.context);
      polyPaint = new PolyPaint(drawingCanvas.canvas, [pencil]);
      polyPaint.attachListeners();

      // Émuler un changement de couleur
      const input = document.getElementById("input-color");
      input.value = "#ff00ff"; // 255,0,255
      input.dispatchEvent(new Event("change"));

      // Dessiner une ligne de 10:10 à 20:10
      polyPaint.canvas.dispatchEvent(configureEvent("mousedown", 10, 10));
      polyPaint.canvas.dispatchEvent(configureEvent("mousemove", 20, 10));
      polyPaint.canvas.dispatchEvent(configureEvent("mouseup", 20, 10));

      // Récupérer un pixel et vérifier sa couleur RGBA
      const imageData = polyPaint.canvas.getContext("2d").getImageData(15, 10, 1, 1).data;
      expect(Array.from(imageData)).toEqual([255, 0, 255, 255]);
    });

  });
});
