const { BehaviorSubject, fromEvent, from, of } = rxjs;
const { switchMap, map, pairwise, filter } = rxjs.operators;

const input = document.querySelector('#input');
const responseContainer = document.querySelector('#response-container');
const cancelPrevRequestContainer = document.querySelector('#cancel-prev-request-container');
const button = document.querySelector('#button');


// * TASK 1

// Создаём поток из событий клика по button
const clicks$ = fromEvent(button, 'click');

// Подписка на поток
clicks$.subscribe(() => {
    input.value = '';
    responseContainer.innerHTML = '';
    cancelPrevRequestContainer.innerHTML = '';
});


// * TASK 2

// Создаём поток из событий изменения значения в input
const inputChange$ = fromEvent(input, 'input');

resolveCancelRequest();

function resolveCancelRequest() {
    inputChange$.pipe(

        // запрашиваем api с игнорированием долгих предыдущих запросов
        switchMap(() => from(getApiResponse(input.value)))

    ).subscribe(value => {
        cancelPrevRequestContainer.innerHTML = value;
    });
}


// * TASK 3

resolveRaceCondition();

function resolveRaceCondition() {

    // Новый поток с начальным значением длины input.value,
    // нужен чтобы у первого события изменения инпута была пара с предыдущим
    const inputSubject$ = new BehaviorSubject(input.value.length);

    inputSubject$.pipe(

        // образуем пару с предыдущим
        pairwise(),

        // фильтруем по длине
        filter(([a, b]) => a < b),

        // запрашиваем api с игнорированием долгих предыдущих запросов
        switchMap(() => from(getApiResponse(input.value)))

    ).subscribe(value => {
        responseContainer.innerHTML = value;
    });

    inputChange$.pipe(

        // преобразуем событие изменения инпута в длину текущего input.value
        map(() => input.value.length),

    ).subscribe(value => {

        // эмитим значения в BehaviorSubject
        inputSubject$.next(value);
    });
}