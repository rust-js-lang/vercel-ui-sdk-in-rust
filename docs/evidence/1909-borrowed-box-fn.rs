fn invoke(run: impl FnOnce()) {
    run();
}
fn main() {
    let mut callback: Box<dyn Fn()> = Box::new(|| println!("called"));
    invoke(&mut callback);
}
