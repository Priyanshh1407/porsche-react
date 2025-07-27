// divisible by 3 tom 5 cat both tom cat
Scanner sc = new Scanner(System.in);
System.out.println("Enter a num: ");
int num = sc.nextInt();

if(num % 3==0 && num){
    System.out.println("Tom");
} else if(num%5==0){
    System.out.println("Cat");
} else if ((num %3 ==0) && (num %5==0)){
        System.out.println("Cat");
}