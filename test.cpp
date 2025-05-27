// array.cpp: определяет точку входа для консольного приложения.

#include <iostream>
using namespace std;

void fillArray(int *const arr, const int size);
void showArray(const int *const arr, const int size);

int main()
{
    int size = 5;
    int *arr = new int[size];

    fillArray(arr, size);

    showArray(arr, size);

    delete[] arr;
    return 0;
}

void showArray(const int *const arr, const int size)
{
    for (int i = 0; i < size; i++)
    {
        cout << arr[i] << endl;
    }
}

void fillArray(int *const arr, const int size)
{

    for (int i = 0; i < size; i++)
    {
        arr[i] = rand() % 10;
    }
}